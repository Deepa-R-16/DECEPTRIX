import { Router } from "express";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { pool } from "../config/database.js";

const router = Router();

/*
 * GET /api/reports/:caseNumber
 *
 * Returns all data required to build a forensic investigation report.
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
        file_path,
        sha256_hash,
        collected_at
      FROM evidence
      WHERE investigation_id = $1
      ORDER BY collected_at DESC
      `,
      [investigation.id]
    );

    /*
     * 3. AI analysis + manipulation fingerprints
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
        a.analyzed_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'technique', f.technique,
              'confidence', f.confidence,
              'evidence_quote', f.evidence_quote,
              'reasoning', f.reasoning
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS fingerprints
      FROM ai_analyses a
      JOIN submissions s
        ON s.id = a.submission_id
      LEFT JOIN manipulation_fingerprints f
        ON f.analysis_id = a.id
      WHERE s.investigation_id = $1
      GROUP BY
        a.id,
        a.model_name,
        a.model_version,
        a.risk_score,
        a.severity,
        a.confidence,
        a.explanation,
        a.analyzed_at
      ORDER BY a.analyzed_at DESC
      LIMIT 1
      `,
      [investigation.id]
    );

    const analysis =
      analysisResult.rows.length > 0
        ? analysisResult.rows[0]
        : null;

    /*
     * 4. Narrative nodes
     */
    const narrativeNodesResult = await pool.query(
      `
      SELECT
        id,
        node_type,
        node_value,
        platform,
        sha256_hash,
        first_observed_at,
        metadata
      FROM narrative_nodes
      WHERE investigation_id = $1
      ORDER BY first_observed_at DESC NULLS LAST
      `,
      [investigation.id]
    );

    /*
     * 5. Narrative relationships
     */
    const narrativeRelationshipsResult = await pool.query(
      `
      SELECT
        r.id,
        r.source_node_id,
        r.target_node_id,
        r.relationship_type,
        r.confidence,
        r.observed_at
      FROM narrative_relationships r
      JOIN narrative_nodes source
        ON source.id = r.source_node_id
      JOIN narrative_nodes target
        ON target.id = r.target_node_id
      WHERE
        source.investigation_id = $1
        OR target.investigation_id = $1
      ORDER BY r.observed_at DESC
      `,
      [investigation.id]
    );

    /*
     * 6. Threat prediction
     */
    const predictionResult = await pool.query(
      `
      SELECT
        id,
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
     * 7. Chain of custody
     */
    const custodyResult = await pool.query(
      `
      SELECT
        c.id,
        c.evidence_id,
        c.action,
        c.actor,
        c.details,
        c.timestamp
      FROM chain_of_custody c
      WHERE c.investigation_id = $1
      ORDER BY c.timestamp ASC
      `,
      [investigation.id]
    );

    /*
     * 8. Report metadata
     */
    const reportsResult = await pool.query(
      `
      SELECT
        id,
        report_type,
        file_path,
        report_hash,
        generated_at
      FROM forensic_reports
      WHERE investigation_id = $1
      ORDER BY generated_at DESC
      `,
      [investigation.id]
    );

    res.json({
      status: "ok",
      data: {
        investigation,
        evidence: evidenceResult.rows,
        analysis,
        narrative: {
          nodes: narrativeNodesResult.rows,
          relationships: narrativeRelationshipsResult.rows,
        },
        threatPrediction,
        chainOfCustody: custodyResult.rows,
        reports: reportsResult.rows,
      },
    });
  } catch (error) {
    console.error("Reports error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load investigation report data",
    });
  }
});

/*
 * POST /api/reports/:caseNumber/generate
 *
 * Generates and stores a forensic report.
 */
router.post("/:caseNumber/generate", async (req, res) => {
  const client = await pool.connect();

  try {
    const { caseNumber } = req.params;

    await client.query("BEGIN");

    /*
     * 1. Find investigation
     */
    const investigationResult = await client.query(
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
      await client.query("ROLLBACK");

      return res.status(404).json({
        status: "error",
        message: "Investigation not found",
      });
    }

    const investigation = investigationResult.rows[0];

    /*
     * 2. Evidence
     */
    const evidenceResult = await client.query(
      `
      SELECT
        id,
        evidence_type,
        description,
        source,
        file_path,
        sha256_hash,
        collected_at
      FROM evidence
      WHERE investigation_id = $1
      ORDER BY collected_at DESC
      `,
      [investigation.id]
    );

    /*
     * 3. AI analysis
     */
    const analysisResult = await client.query(
      `
      SELECT
        a.id,
        a.model_name,
        a.model_version,
        a.risk_score,
        a.severity,
        a.confidence,
        a.explanation,
        a.analyzed_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', f.id,
              'technique', f.technique,
              'confidence', f.confidence,
              'evidence_quote', f.evidence_quote,
              'reasoning', f.reasoning
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS fingerprints
      FROM ai_analyses a
      JOIN submissions s
        ON s.id = a.submission_id
      LEFT JOIN manipulation_fingerprints f
        ON f.analysis_id = a.id
      WHERE s.investigation_id = $1
      GROUP BY
        a.id,
        a.model_name,
        a.model_version,
        a.risk_score,
        a.severity,
        a.confidence,
        a.explanation,
        a.analyzed_at
      ORDER BY a.analyzed_at DESC
      LIMIT 1
      `,
      [investigation.id]
    );

    const analysis =
      analysisResult.rows.length > 0
        ? analysisResult.rows[0]
        : null;

    /*
     * 4. Narrative intelligence
     */
    const narrativeNodesResult = await client.query(
      `
      SELECT
        id,
        node_type,
        node_value,
        platform,
        sha256_hash,
        first_observed_at,
        metadata
      FROM narrative_nodes
      WHERE investigation_id = $1
      ORDER BY first_observed_at DESC NULLS LAST
      `,
      [investigation.id]
    );

    const narrativeRelationshipsResult = await client.query(
      `
      SELECT
        r.id,
        r.source_node_id,
        r.target_node_id,
        r.relationship_type,
        r.confidence,
        r.observed_at
      FROM narrative_relationships r
      JOIN narrative_nodes source
        ON source.id = r.source_node_id
      JOIN narrative_nodes target
        ON target.id = r.target_node_id
      WHERE
        source.investigation_id = $1
        OR target.investigation_id = $1
      ORDER BY r.observed_at DESC
      `,
      [investigation.id]
    );

    /*
     * 5. Threat prediction
     */
    const predictionResult = await client.query(
      `
      SELECT
        id,
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
     * 6. Chain of custody
     */
    const custodyResult = await client.query(
      `
      SELECT
        id,
        evidence_id,
        action,
        actor,
        details,
        timestamp
      FROM chain_of_custody
      WHERE investigation_id = $1
      ORDER BY timestamp ASC
      `,
      [investigation.id]
    );

    /*
     * 7. Build forensic report object
     */
    const report = {
      report_title: "DECEPTRIX Forensic Investigation Report",
      generated_by: "DECEPTRIX",
      generated_at: new Date().toISOString(),

      investigation,

      evidence: evidenceResult.rows,

      ai_analysis: analysis,

      narrative_intelligence: {
        nodes: narrativeNodesResult.rows,
        relationships: narrativeRelationshipsResult.rows,
      },

      threat_prediction: threatPrediction,

      chain_of_custody: custodyResult.rows,

      conclusion: {
        severity: investigation.severity,
        threat_score: Number(investigation.threat_score),
        threat_probability: threatPrediction
          ? Number(threatPrediction.threat_probability)
          : null,
        propagation_velocity:
          threatPrediction?.propagation_velocity || null,
      },
    };

    /*
     * 8. Convert report to canonical JSON
     */
    const reportContent = JSON.stringify(report, null, 2);

    /*
     * 9. Generate SHA-256 hash of report
     */
    const reportHash = createHash("sha256")
      .update(reportContent, "utf8")
      .digest("hex");

    /* 
 * 10. Save forensic report to disk
 */
const reportsDir = path.resolve(process.cwd(), "reports");

await fs.mkdir(reportsDir, { recursive: true });

const fileName = `${caseNumber}.json`;
const filePath = path.join(reportsDir, fileName);

await fs.writeFile(filePath, reportContent, "utf8");

    /*
     * /*
 * 11. Store report metadata
 */
    const reportResult = await client.query(
      `
      INSERT INTO forensic_reports
        (
          investigation_id,
          report_type,
          file_path,
          report_hash
        )
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id,
        investigation_id,
        report_type,
        file_path,
        report_hash,
        generated_at
      `,
      [
  investigation.id,
  "FORENSIC_JSON",
  filePath,
  reportHash,
],
    );

    await client.query("COMMIT");

    /*
     * 11. Return generated report
     */
    return res.status(201).json({
      status: "ok",
      message: "Forensic report generated successfully",
      report: {
        metadata: reportResult.rows[0],
        content: report,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Report generation error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to generate forensic report",
    });
  } finally {
    client.release();
  }
});

/*
 * GET /api/reports/:caseNumber/download
 *
 * Downloads the generated forensic JSON report.
 */
router.get("/:caseNumber/download", async (req, res) => {
  try {
    const { caseNumber } = req.params;

    const result = await pool.query(
      `
      SELECT
        file_path,
        report_hash
      FROM forensic_reports fr
      JOIN investigations i
        ON i.id = fr.investigation_id
      WHERE i.case_number = $1
      ORDER BY fr.generated_at DESC
      LIMIT 1
      `,
      [caseNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No forensic report found for this case",
      });
    }

    const { file_path: filePath, report_hash: reportHash } =
      result.rows[0];

    if (!filePath) {
      return res.status(404).json({
        status: "error",
        message: "Report file has not been generated",
      });
    }

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        status: "error",
        message: "Report file does not exist on disk",
      });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${caseNumber}-forensic-report.json"`
    );

    res.setHeader("Content-Type", "application/json");

    res.setHeader("X-Report-SHA256", reportHash);

    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Report download error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to download forensic report",
    });
  }
});

export default router;