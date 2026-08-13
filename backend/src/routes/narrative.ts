import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

// GET /api/narrative
router.get("/", async (_req, res) => {
  try {
    const nodesResult = await pool.query(`
      SELECT
        nn.id,
        nn.investigation_id,
        nn.node_type,
        nn.node_value,
        nn.platform,
        nn.first_observed_at
      FROM narrative_nodes nn
      ORDER BY nn.first_observed_at DESC
      LIMIT 200
    `);

    const relationshipsResult = await pool.query(`
      SELECT
        nr.id,
        nr.source_node_id,
        nr.target_node_id,
        nr.relationship_type,
        nr.confidence,
        nr.observed_at,

        source_i.case_number AS source_case_number,
        target_i.case_number AS target_case_number,

        source_node.platform AS source_platform,
        target_node.platform AS target_platform

      FROM narrative_relationships nr

      JOIN narrative_nodes source_node
        ON source_node.id = nr.source_node_id

      JOIN narrative_nodes target_node
        ON target_node.id = nr.target_node_id

      LEFT JOIN investigations source_i
        ON source_i.id = source_node.investigation_id

      LEFT JOIN investigations target_i
        ON target_i.id = target_node.investigation_id

      ORDER BY nr.observed_at DESC
      LIMIT 500
    `);

    return res.json({
      status: "ok",
      data: {
        nodes: nodesResult.rows,
        relationships: relationshipsResult.rows,
      },
    });
  } catch (error) {
    console.error("Narrative intelligence error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to load narrative intelligence",
    });
  }
});

export default router;