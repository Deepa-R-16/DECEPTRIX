import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

// GET /api/threat-intelligence
router.get("/", async (_req, res) => {
  try {
    // 1. Manipulation techniques
    const result = await pool.query(`
      SELECT
        mf.technique,
        COUNT(*)::int AS detections,
        ROUND(AVG(mf.confidence), 2) AS average_confidence,
        MAX(mf.evidence_quote) AS example_evidence
      FROM manipulation_fingerprints mf
      GROUP BY mf.technique
      ORDER BY detections DESC, average_confidence DESC
    `);

    // 2. Severity distribution
    const severityResult = await pool.query(`
      SELECT
        UPPER(COALESCE(severity, 'UNKNOWN')) AS severity,
        COUNT(*)::int AS count
      FROM investigations
      GROUP BY UPPER(COALESCE(severity, 'UNKNOWN'))
      ORDER BY count DESC
    `);

    // 3. Recent AI analyses
    //
    // Correct relationship:
    //
    // investigations
    //      ↓
    // submissions
    //      ↓
    // ai_analyses
    //
    const recentResult = await pool.query(`
      SELECT
        i.case_number,
        i.severity,
        i.threat_score,
        a.confidence,
        a.model_name,
        a.explanation,
        a.analyzed_at
      FROM investigations i
      JOIN submissions s
        ON s.investigation_id = i.id
      JOIN ai_analyses a
        ON a.submission_id = s.id
      ORDER BY a.analyzed_at DESC
      LIMIT 10
    `);

    res.json({
      status: "ok",
      data: {
        techniques: result.rows,
        severityDistribution: severityResult.rows,
        recentAnalyses: recentResult.rows,
      },
    });
  } catch (error) {
    console.error("Threat intelligence error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load threat intelligence",
    });
  }
});

export default router;