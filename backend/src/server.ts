import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import dashboardRouter from "./routes/dashboard.js";
import discoverRouter from "./routes/discover.js";
import investigationsRouter from "./routes/investigations.js";
import threatIntelligenceRouter from "./routes/threatIntelligence.js";
import campaignsRouter from "./routes/campaigns.js";
import narrativeRouter from "./routes/narrative.js";
import forensicsRouter from "./routes/forensics.js";
import reportsRouter from "./routes/reports.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/discover", discoverRouter);
app.use("/api/investigations", investigationsRouter);
app.use("/api/threat-intelligence", threatIntelligenceRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/narrative", narrativeRouter);
app.use("/api/forensics", forensicsRouter);
app.use("/api/reports", reportsRouter);
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "DECEPTRIX API",
    message: "Backend is running",
  });
});

app.get("/api/health/database", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS timestamp"
    );

    res.json({
      status: "ok",
      database: result.rows[0].database,
      timestamp: result.rows[0].timestamp,
    });
  } catch (error) {
  console.error("DATABASE HEALTH CHECK FAILED:", error);

  res.status(500).json({
    status: "error",
    message: "Database connection failed",
  });
}
});

app.listen(PORT, () => {
  console.log(`DECEPTRIX API running on http://localhost:${PORT}`);
});