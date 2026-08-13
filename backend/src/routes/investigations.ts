import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

/*
 * GET /api/investigations
 *
 * Returns recent investigations with their latest AI analysis.
 */
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,
        i.case_number,
        i.title,
        i.status,
        i.severity,
        i.threat_score,
        i.created_at,
        i.updated_at,

        a.id AS analysis_id,
        a.model_name,
        a.model_version,
        a.risk_score,
        a.confidence,
        a.explanation

      FROM investigations i

      LEFT JOIN LATERAL (
        SELECT
          a.id,
          a.model_name,
          a.model_version,
          a.risk_score,
          a.confidence,
          a.explanation
        FROM submissions s
        JOIN ai_analyses a
          ON a.submission_id = s.id
        WHERE s.investigation_id = i.id
        ORDER BY a.analyzed_at DESC
        LIMIT 1
      ) a ON true

      ORDER BY i.created_at DESC
    `);

    res.json({
      status: "ok",
      data: result.rows,
    });
  } catch (error) {
    console.error("Investigations error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load investigations",
    });
  }
});

/*
 * GET /api/investigations/:caseNumber
 *
 * Returns complete investigation intelligence.
 */
router.get("/:caseNumber", async (req, res) => {
  try {
    const { caseNumber } = req.params;

    /*
     * 1. Investigation
     */
    const investigationResult = await pool.query(
      `
      SELECT
        id,
        case_number,
        title,
        status,
        severity,
        threat_score,
        created_at,
        updated_at
      FROM investigations
      WHERE case_number = $1
      `,
      [caseNumber]
    );

    if (investigationResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Investigation not found",
      });
    }

    const investigation = investigationResult.rows[0];

    /*
     * 2. Evidence
     */
    const evidenceResult = await pool.query(
      `
      SELECT
        id,
        evidence_type,
        description,
        source,
        collected_at
      FROM evidence
      WHERE investigation_id = $1
      ORDER BY collected_at DESC
      `,
      [investigation.id]
    );

    /*
     * 3. Latest AI analysis
     */
    const analysisResult = await pool.query(
      `
      SELECT
        a.id,
        a.model_name,
        a.model_version,
        a.risk_score,
        a.severity,
        a.confidence,
        a.explanation,
        a.analyzed_at
      FROM investigations i
      JOIN submissions s
        ON s.investigation_id = i.id
      JOIN ai_analyses a
        ON a.submission_id = s.id
      WHERE i.case_number = $1
      ORDER BY a.analyzed_at DESC
      LIMIT 1
      `,
      [caseNumber]
    );

    let analysis: any = null;

    if (analysisResult.rows.length > 0) {
      analysis = analysisResult.rows[0];

      /*
       * 4. Manipulation fingerprints
       */
      const fingerprintsResult = await pool.query(
        `
        SELECT
          id,
          technique,
          confidence,
          evidence_quote,
          reasoning
        FROM manipulation_fingerprints
        WHERE analysis_id = $1
        ORDER BY confidence DESC
        `,
        [analysis.id]
      );

      analysis.fingerprints = fingerprintsResult.rows;
    }

    /*
     * 5. Narrative node
     */
    const narrativeNodeResult = await pool.query(
      `
      SELECT
        id,
        investigation_id,
        node_type,
        node_value,
        platform,
        first_observed_at
      FROM narrative_nodes
      WHERE investigation_id = $1
      ORDER BY first_observed_at DESC
      LIMIT 1
      `,
      [investigation.id]
    );

    const narrativeNode =
      narrativeNodeResult.rows.length > 0
        ? narrativeNodeResult.rows[0]
        : null;

    /*
     * 6. Narrative relationships
     */
    let relationships: any[] = [];

    if (narrativeNode) {
      const relationshipsResult = await pool.query(
        `
        SELECT
          nr.source_node_id,
          nr.target_node_id,
          nr.relationship_type,
          nr.confidence,
          sn.platform AS source_platform
        FROM narrative_relationships nr
        LEFT JOIN narrative_nodes sn
          ON sn.id = nr.source_node_id
        WHERE nr.target_node_id = $1
           OR nr.source_node_id = $1
        ORDER BY nr.confidence DESC
        `,
        [narrativeNode.id]
      );

      relationships = relationshipsResult.rows;
    }

    /*
     * 7. Threat propagation prediction
     */
    const predictionResult = await pool.query(
      `
      SELECT
        id,
        investigation_id,
        threat_probability,
        propagation_velocity,
        target_profile,
        prediction_reasoning,
        created_at
      FROM threat_predictions
      WHERE investigation_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [investigation.id]
    );

    const threatPrediction =
      predictionResult.rows.length > 0
        ? predictionResult.rows[0]
        : null;

    /*
     * 8. Complete response
     */
    res.json({
      status: "ok",

      data: {
        investigation,

        evidence: evidenceResult.rows,

        analysis,

        narrative: {
          node: narrativeNode,
          relationships,
        },

        threatPrediction,
      },
    });
  } catch (error) {
    console.error("Investigation details error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load investigation",
    });
  }
});

export default router;