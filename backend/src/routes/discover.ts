import { Router } from "express";
import { createHash } from "crypto";
import { pool } from "../config/database.js";
import { analyzeContent } from "../services/aiEngine.js";
import { trackNarrative } from "../services/narrativeEngine.js";
import { generateThreatPrediction } from "../services/threatPredictionEngine.js";

const router = Router();

// POST /api/discover
router.post("/", async (req, res) => {
  try {
    const { content, source } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Content is required",
      });
    }

    const normalizedContent = content.trim();

    // Generate SHA-256 fingerprint for the submitted content
    const sha256Hash = createHash("sha256")
      .update(normalizedContent, "utf8")
      .digest("hex");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      /*
       * 1. Create investigation
       */
      const investigationResult = await client.query(
        `INSERT INTO investigations
          (
            case_number,
            title,
            status,
            severity,
            threat_score
          )
         VALUES
          (
            DEFAULT,
            $1,
            'ACTIVE',
            'UNKNOWN',
            0
          )
         RETURNING
          id,
          case_number,
          title,
          status,
          severity,
          threat_score,
          created_at`,
        ["Suspicious Content Investigation"]
      );

      const investigation = investigationResult.rows[0];

      /*
       * 2. Store submitted content
       */
      const submissionResult = await client.query(
        `INSERT INTO submissions
          (
            investigation_id,
            content_type,
            original_text,
            source_url
          )
         VALUES
          ($1, 'TEXT', $2, $3)
         RETURNING
          id,
          investigation_id,
          content_type,
          original_text,
          source_url,
          submitted_at`,
        [
          investigation.id,
          normalizedContent,
          source?.trim() || null,
        ]
      );

      const submission = submissionResult.rows[0];

      /*
       * 3. Store evidence with SHA-256 hash
       */
      const evidenceResult = await client.query(
        `INSERT INTO evidence
          (
            investigation_id,
            evidence_type,
            description,
            source,
            sha256_hash
          )
         VALUES
          ($1, 'TEXT', $2, $3, $4)
         RETURNING
          id,
          investigation_id,
          evidence_type,
          description,
          source,
          sha256_hash,
          collected_at`,
        [
          investigation.id,
          normalizedContent,
          source?.trim() || "Manual submission",
          sha256Hash,
        ]
      );

      const evidence = evidenceResult.rows[0];

      /*
       * 3.1. Create initial chain-of-custody record
       */
      await client.query(
        `INSERT INTO chain_of_custody
          (
            investigation_id,
            evidence_id,
            action,
            actor,
            details
          )
         VALUES
          ($1, $2, $3, $4, $5)`,
        [
          investigation.id,
          evidence.id,
          "EVIDENCE_COLLECTED",
          "DECEPTRIX",
          `Evidence collected from ${
            source?.trim() || "Manual submission"
          }. SHA-256: ${sha256Hash}`,
        ]
      );

      /*
       * 4. Run DECEPTRIX AI analysis
       */
      const analysis = analyzeContent(normalizedContent);

      /*
       * 5. Store AI analysis
       */
      const aiAnalysisResult = await client.query(
        `INSERT INTO ai_analyses
          (
            submission_id,
            model_name,
            model_version,
            risk_score,
            severity,
            confidence,
            explanation,
            raw_response
          )
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
          id,
          submission_id,
          model_name,
          model_version,
          risk_score,
          severity,
          confidence,
          explanation,
          analyzed_at`,
        [
          submission.id,
          analysis.model_name,
          analysis.model_version,
          analysis.risk_score,
          analysis.severity,
          analysis.confidence,
          analysis.explanation,
          JSON.stringify(analysis.raw_response),
        ]
      );

      const aiAnalysis = aiAnalysisResult.rows[0];

      /*
       * 6. Store manipulation fingerprints
       */
      for (const fingerprint of analysis.fingerprints) {
        await client.query(
          `INSERT INTO manipulation_fingerprints
            (
              analysis_id,
              technique,
              confidence,
              evidence_quote,
              reasoning
            )
           VALUES
            ($1, $2, $3, $4, $5)`,
          [
            aiAnalysis.id,
            fingerprint.technique,
            fingerprint.confidence,
            fingerprint.evidence_quote,
            fingerprint.reasoning,
          ]
        );
      }

      /*
       * 7. Update investigation with AI result
       */
      const updatedInvestigationResult = await client.query(
        `UPDATE investigations
         SET
           severity = $1,
           threat_score = $2,
           updated_at = NOW()
         WHERE id = $3
         RETURNING
           id,
           case_number,
           title,
           status,
           severity,
           threat_score,
           created_at,
           updated_at`,
        [
          analysis.severity,
          analysis.risk_score,
          investigation.id,
        ]
      );

      const updatedInvestigation =
        updatedInvestigationResult.rows[0];

      /*
       * 8. Track narrative origin and mutation
       */
      const narrative = await trackNarrative(
        client,
        investigation.id,
        normalizedContent,
        source?.trim() || "Manual submission"
      );

      /*
       * 9. Generate threat propagation prediction
       */
      const prediction = await generateThreatPrediction(
        client,
        investigation.id
      );

      /*
       * 10. Store threat prediction
       */
      const predictionResult = await client.query(
        `
        INSERT INTO threat_predictions
          (
            investigation_id,
            threat_probability,
            propagation_velocity,
            target_profile,
            prediction_reasoning
          )
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING
          id,
          investigation_id,
          threat_probability,
          propagation_velocity,
          target_profile,
          prediction_reasoning,
          created_at
        `,
        [
          investigation.id,
          prediction.threat_probability,
          prediction.propagation_velocity,
          JSON.stringify(prediction.target_profile),
          prediction.prediction_reasoning,
        ]
      );

      const threatPrediction = predictionResult.rows[0];

      /*
       * 11. Commit transaction
       */
      await client.query("COMMIT");

      /*
       * 12. Return complete result
       */
      return res.status(201).json({
        status: "ok",
        message: "Content analyzed successfully",

        investigation: updatedInvestigation,

        evidence,

        narrative,

        threatPrediction,

        analysis: {
          id: aiAnalysis.id,
          model_name: aiAnalysis.model_name,
          model_version: aiAnalysis.model_version,
          risk_score: aiAnalysis.risk_score,
          severity: aiAnalysis.severity,
          confidence: aiAnalysis.confidence,
          explanation: aiAnalysis.explanation,
          fingerprints: analysis.fingerprints,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Discover error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to analyze content",
    });
  }
});

export default router;