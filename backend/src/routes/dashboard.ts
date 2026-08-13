import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", async (_req, res) => {
  try {
    // Active investigations
    const activeInvestigationsResult = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM investigations
      WHERE UPPER(COALESCE(status, '')) = 'ACTIVE'
    `);

    // Critical threats
    const criticalThreatsResult = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM investigations
      WHERE UPPER(COALESCE(severity, '')) = 'CRITICAL'
    `);

    // Average threat score
    const threatScoreResult = await pool.query(`
      SELECT COALESCE(AVG(threat_score), 0)::numeric(10,2) AS average
      FROM investigations
      WHERE threat_score IS NOT NULL
    `);

    // Total AI analysis requests
    const aiRequestsResult = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM ai_analyses
    `);

    // Threat distribution
    const threatDistributionResult = await pool.query(`
      SELECT
        UPPER(COALESCE(severity, 'UNKNOWN')) AS severity,
        COUNT(*)::int AS count
      FROM investigations
      GROUP BY UPPER(COALESCE(severity, 'UNKNOWN'))
      ORDER BY count DESC
    `);

    // Recent investigations
    const recentInvestigationsResult = await pool.query(`
      SELECT
        id,
        case_number,
        title,
        status,
        severity,
        threat_score,
        created_at
      FROM investigations
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Latest manipulation techniques
    const fingerprintsResult = await pool.query(`
      SELECT
        mf.technique,
        COUNT(*)::int AS count,
        ROUND(AVG(mf.confidence), 2) AS average_confidence
      FROM manipulation_fingerprints mf
      GROUP BY mf.technique
      ORDER BY count DESC, average_confidence DESC
      LIMIT 5
    `);

    res.json({
      status: "ok",

      data: {
        activeInvestigations:
          activeInvestigationsResult.rows[0].count,

        criticalThreats:
          criticalThreatsResult.rows[0].count,

        averageThreatScore: Number(
          threatScoreResult.rows[0].average
        ),

        aiEngine: "ONLINE",

        aiProvider: "DECEPTRIX-Local-Analyzer",

        analysisRequests:
          aiRequestsResult.rows[0].count,

        threatDistribution:
          threatDistributionResult.rows,

        recentInvestigations:
          recentInvestigationsResult.rows,

        manipulationTechniques:
          fingerprintsResult.rows,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load dashboard statistics",
    });
  }
});

export default router;