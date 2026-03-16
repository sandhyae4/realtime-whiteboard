const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", async (req, res) => {
  let dbStatus = "connected", dbLatencyMs = null;
  try {
    const t = Date.now();
    await mongoose.connection.db.admin().ping();
    dbLatencyMs = Date.now() - t;
  } catch { dbStatus = "disconnected"; }

  const status = dbStatus === "connected" ? "ok" : "degraded";
  res.status(status === "ok" ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: { seconds: Math.floor(process.uptime()) },
    database: { status: dbStatus, latencyMs: dbLatencyMs },
    memory: { heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB" },
  });
});

// Readiness probe
router.get("/ready", async (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ready, db: ready ? "connected" : "not ready" });
});

module.exports = router;
