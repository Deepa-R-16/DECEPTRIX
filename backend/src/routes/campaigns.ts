import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

/*
 * GET /api/campaigns
 *
 * Detects coordinated deception campaigns from existing
 * investigations by grouping cases that share manipulation
 * techniques.
 */
router.get("/", async (_req, res) => {
  try {
    /*
     * Find techniques shared by multiple investigations.
     *
     * Relationship:
     *
     * investigations
     *      ↓
     * submissions
     *      ↓
     * ai_analyses
     *      ↓
     * manipulation_fingerprints
     */
    const result = await pool.query(`
      WITH investigation_techniques AS (
        SELECT DISTINCT
          i.id AS investigation_id,
          i.case_number,
          i.title,
          i.severity,
          i.threat_score,
          i.created_at,
          mf.technique
        FROM investigations i
        JOIN submissions s
          ON s.investigation_id = i.id
        JOIN ai_analyses a
          ON a.submission_id = s.id
        JOIN manipulation_fingerprints mf
          ON mf.analysis_id = a.id
      ),

      shared_techniques AS (
        SELECT
          technique,
          COUNT(DISTINCT investigation_id)::int AS investigation_count
        FROM investigation_techniques
        GROUP BY technique
        HAVING COUNT(DISTINCT investigation_id) >= 2
      )

      SELECT
        it.technique,
        st.investigation_count,
        json_agg(
          json_build_object(
            'id', it.investigation_id,
            'case_number', it.case_number,
            'title', it.title,
            'severity', it.severity,
            'threat_score', it.threat_score,
            'created_at', it.created_at
          )
          ORDER BY it.created_at DESC
        ) AS investigations
      FROM investigation_techniques it
      JOIN shared_techniques st
        ON st.technique = it.technique
      GROUP BY
        it.technique,
        st.investigation_count
      ORDER BY st.investigation_count DESC;
    `);

    /*
     * Convert shared techniques into campaign objects.
     */
    const campaigns = result.rows.map((row, index) => {
      const investigations = row.investigations;

      const averageThreatScore =
        investigations.length > 0
          ? investigations.reduce(
              (sum: number, item: any) =>
                sum + Number(item.threat_score || 0),
              0
            ) / investigations.length
          : 0;

      /*
       * Coordination score:
       *
       * More related investigations = stronger coordination.
       * Shared technique confidence is also reflected indirectly
       * through the number of correlated investigations.
       */
      const coordinationScore = Math.min(
        100,
        50 + investigations.length * 10
      );

      let riskLevel = "LOW";

      if (averageThreatScore >= 70) {
        riskLevel = "CRITICAL";
      } else if (averageThreatScore >= 50) {
        riskLevel = "HIGH";
      } else if (averageThreatScore >= 25) {
        riskLevel = "MEDIUM";
      }

      return {
        id: `CAMPAIGN-${new Date().getFullYear()}-${String(
          index + 1
        ).padStart(6, "0")}`,

        campaign_name: `${row.technique
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char: string) => char.toUpperCase())} Campaign`,

        technique: row.technique,

        investigation_count: investigations.length,

        coordination_score: Number(coordinationScore.toFixed(2)),

        average_threat_score: Number(
          averageThreatScore.toFixed(2)
        ),

        risk_level: riskLevel,

        investigations,
      };
    });

    res.json({
      status: "ok",
      data: campaigns,
    });
  } catch (error) {
    console.error("Campaign intelligence error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load campaign intelligence",
    });
  }
});

export default router;