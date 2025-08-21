// routes/telemetry.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
require('dotenv').config();

// Endpoint to get telemetry data
router.get("/", async (req, res) => {
  const { type, timeframe, device_id } = req.query;

  const table = {
    thermal: "thermal_data",
    power: "power_data",
    attitude: "attitude_data"
  }[type];

  if (!table) return res.status(400).send("Invalid telemetry type");

  const interval = timeframe === "day" ? "1 day" : "1 hour";

  let query = `SELECT * FROM ${table} WHERE timestamp > NOW() - INTERVAL '${interval}'`;
  const params = [];

  if (device_id) {
    query += ` AND device_id = $1`;
    params.push(device_id);
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Query failed:", err);
    res.status(500).send("Database error");
  }
});

module.exports = router;
