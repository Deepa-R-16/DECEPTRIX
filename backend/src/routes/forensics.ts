import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

/*
 * GET /api/forensics
 *
 * Returns forensic evidence, hashes and chain-of-custody data.
 */
router.get("/", async (_req, res) => {
  try {
    const evidenceResult = await pool.query(`
      SELECT
        e.id,
        e.investigation_id,
        i.case_number,
        i.title,
        e.evidence_type,
        e.description,
        e.source,
        e.file_path,
        e.sha256_hash,
        e.collected_at
      FROM evidence e
      JOIN investigations i
        ON i.id = e.investigation_id
      ORDER BY e.collected_at DESC
    `);

    const custodyResult = await pool.query(`
      SELECT
        c.id,
        c.investigation_id,
        i.case_number,
        c.evidence_id,
        c.action,
        c.actor,
        c.details,
        c.timestamp
      FROM chain_of_custody c
      JOIN investigations i
        ON i.id = c.investigation_id
      ORDER BY c.timestamp DESC
    `);

    res.json({
      status: "ok",
      data: {
        evidence: evidenceResult.rows,
        chainOfCustody: custodyResult.rows,
      },
    });
  } catch (error) {
    console.error("Forensics error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load forensic data",
    });
  }
});

/*
 * GET /api/forensics/:caseNumber
 *
 * Returns forensic data for one investigation.
 */
router.get("/:caseNumber", async (req, res) => {
  try {
    const { caseNumber } = req.params;

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

    const custodyResult = await pool.query(
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
      ORDER BY timestamp DESC
      `,
      [investigation.id]
    );

    res.json({
      status: "ok",
      data: {
        investigation,
        evidence: evidenceResult.rows,
        chainOfCustody: custodyResult.rows,
      },
    });
  } catch (error) {
    console.error("Forensic investigation error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to load forensic investigation",
    });
  }
});

export default router;