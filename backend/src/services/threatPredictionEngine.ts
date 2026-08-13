import { PoolClient } from "pg";

interface PredictionResult {
  threat_probability: number;
  propagation_velocity: string;
  target_profile: {
    platforms: string[];
    audience: string;
    risk_factors: string[];
  };
  prediction_reasoning: string;
}

export async function generateThreatPrediction(
  client: PoolClient,
  investigationId: string
): Promise<PredictionResult> {
  /*
   * 1. Get current investigation
   */
  const investigationResult = await client.query(
    `
    SELECT
      id,
      severity,
      threat_score
    FROM investigations
    WHERE id = $1
    `,
    [investigationId]
  );

  if (investigationResult.rows.length === 0) {
    throw new Error("Investigation not found");
  }

  const investigation = investigationResult.rows[0];

  /*
   * 2. Get manipulation fingerprints
   */
  const fingerprintResult = await client.query(
    `
    SELECT
      mf.technique,
      mf.confidence
    FROM manipulation_fingerprints mf
    JOIN ai_analyses a
      ON a.id = mf.analysis_id
    JOIN submissions s
      ON s.id = a.submission_id
    WHERE s.investigation_id = $1
    `,
    [investigationId]
  );

  /*
   * 3. Get narrative relationships
   */
  const narrativeResult = await client.query(
  `
  SELECT
    nr.relationship_type,
    nr.confidence,
    source.platform AS source_platform,
    target.platform AS target_platform
  FROM narrative_relationships nr
  JOIN narrative_nodes source
    ON source.id = nr.source_node_id
  JOIN narrative_nodes target
    ON target.id = nr.target_node_id
  WHERE
    source.investigation_id = $1
    OR target.investigation_id = $1
  `,
  [investigationId]
);

  /*
     /*
   * 4. Calculate prediction score
   *
   * Weighted prediction model:
   * - Existing threat score: 55%
   * - Manipulation confidence: 20%
   * - Narrative propagation: 15%
   * - Severity: 10%
   */

  const fingerprints = fingerprintResult.rows;

  const baseThreatScore =
    Number(investigation.threat_score) || 0;

  let probability = baseThreatScore * 0.55;

  /*
   * Manipulation confidence contribution
   */
  if (fingerprints.length > 0) {
    const averageFingerprintConfidence =
      fingerprints.reduce(
        (sum, item) =>
          sum + Number(item.confidence),
        0
      ) / fingerprints.length;

    probability += averageFingerprintConfidence * 0.20;
  }

  /*
   * Repeated narratives increase propagation risk.
   */
  const narrativeCount =
    narrativeResult.rows.length;

  probability += Math.min(
    narrativeCount * 3,
    15
  );

  /*
   * Severity contribution
   */
  if (investigation.severity === "HIGH") {
    probability += 10;
  } else if (
    investigation.severity === "MEDIUM"
  ) {
    probability += 5;
  }

  /*
   * Keep probability below absolute certainty.
   */
  probability = Math.min(
    99,
    Number(probability.toFixed(2))
  );

  /*
   * 5. Determine propagation velocity
   */
  let propagationVelocity = "LOW";

  if (probability >= 75) {
    propagationVelocity = "RAPID";
  } else if (probability >= 50) {
    propagationVelocity = "MODERATE";
  }

  /*
   * 6. Determine target profile
   */
  const platforms = [
  ...new Set(
    narrativeResult.rows.flatMap((row) =>
      [row.source_platform, row.target_platform].filter(Boolean)
    )
  ),
];

  if (platforms.length === 0) {
    platforms.push("Digital communication platforms");
  }

  const riskFactors: string[] = [];

  if (fingerprints.length > 0) {
    riskFactors.push(
      `${fingerprints.length} manipulation technique(s) detected`
    );
  }

  if (narrativeCount > 0) {
    riskFactors.push(
      `${narrativeCount} related narrative relationship(s) detected`
    );
  }

  if (investigation.threat_score >= 30) {
    riskFactors.push("Elevated deception risk score");
  }

  /*
   * 7. Audience estimation
   */
  let audience = "General digital users";

  const techniques = fingerprints.map(
    (item) => item.technique
  );

  if (
    techniques.includes("URGENCY_PRESSURE") ||
    techniques.includes("FEAR_APPEAL")
  ) {
    audience = "High-engagement and emotionally reactive users";
  }

  /*
   * 8. Generate reasoning
   */
  const predictionReasoning =
    probability >= 75
      ? "The investigation contains multiple deception indicators and evidence of narrative propagation. The combination suggests a high likelihood of continued dissemination."
      : probability >= 50
      ? "The investigation contains measurable manipulation indicators and related narrative activity. Continued propagation is possible and should be monitored."
      : "The investigation currently shows limited propagation indicators. Continued monitoring is recommended.";

  return {
    threat_probability: probability,
    propagation_velocity: propagationVelocity,
    target_profile: {
      platforms,
      audience,
      risk_factors: riskFactors,
    },
    prediction_reasoning: predictionReasoning,
  };
}