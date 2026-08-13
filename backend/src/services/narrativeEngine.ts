import { PoolClient } from "pg";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWords(text: string): Set<string> {
  return new Set(
    normalizeText(text)
      .split(" ")
      .filter((word) => word.length > 2)
  );
}

function calculateSimilarity(
  textA: string,
  textB: string
): number {
  const wordsA = getWords(textA);
  const wordsB = getWords(textB);

  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const word of wordsA) {
    if (wordsB.has(word)) {
      intersection++;
    }
  }

  const union = new Set([...wordsA, ...wordsB]).size;

  if (union === 0) {
    return 0;
  }

  return (intersection / union) * 100;
}

export async function trackNarrative(
  client: PoolClient,
  investigationId: string,
  content: string,
  source: string
) {
  /*
   * 1. Create the current narrative node
   */
  const currentNodeResult = await client.query(
    `
    INSERT INTO narrative_nodes
      (
        investigation_id,
        node_type,
        node_value,
        platform,
        first_observed_at,
        metadata
      )
    VALUES
      ($1, 'CONTENT', $2, $3, NOW(), $4)
    RETURNING
      id,
      investigation_id,
      node_type,
      node_value,
      platform,
      first_observed_at
    `,
    [
      investigationId,
      content,
      source,
      JSON.stringify({
        detection_method: "DECEPTRIX-Narrative-Engine",
      }),
    ]
  );

  const currentNode = currentNodeResult.rows[0];

  /*
   * 2. Find previous narrative nodes
   */
  const previousNodesResult = await client.query(
    `
    SELECT
      id,
      investigation_id,
      node_value,
      platform,
      first_observed_at
    FROM narrative_nodes
    WHERE id != $1
    ORDER BY first_observed_at DESC
    LIMIT 100
    `,
    [currentNode.id]
  );

  const relationships = [];

  /*
   * 3. Compare current content with previous content
   */
  for (const previous of previousNodesResult.rows) {
    const similarity = calculateSimilarity(
      content,
      previous.node_value
    );

    /*
     * Ignore unrelated content.
     */
    if (similarity < 40) {
      continue;
    }

    let relationshipType = "RELATED_NARRATIVE";

    /*
     * Very high similarity means essentially
     * the same narrative.
     */
    if (similarity >= 80) {
      relationshipType = "SAME_NARRATIVE";
    }

    /*
     * Medium/high similarity suggests that the
     * narrative may have been modified.
     */
    else if (similarity >= 55) {
      relationshipType = "MUTATION";
    }

    await client.query(
      `
      INSERT INTO narrative_relationships
        (
          source_node_id,
          target_node_id,
          relationship_type,
          confidence,
          observed_at
        )
      VALUES
        ($1, $2, $3, $4, NOW())
      `,
      [
        previous.id,
        currentNode.id,
        relationshipType,
        Number(similarity.toFixed(2)),
      ]
    );

    relationships.push({
      source_node_id: previous.id,
      target_node_id: currentNode.id,
      relationship_type: relationshipType,
      confidence: Number(similarity.toFixed(2)),
      source_platform: previous.platform,
    });
  }

  return {
    node: currentNode,
    relationships,
  };
}