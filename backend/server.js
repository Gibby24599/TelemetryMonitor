const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const net = require("net");
const pool = require("./db");
const telemetryRoutes = require("./routes/telemetry");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Middleware
app.use(bodyParser.json());

// Use telemetry routes
app.use("/api/telemetry", telemetryRoutes);

// TCP Server - Receive telemetry data
const tcpServer = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const lines = data.toString().split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        // Insert telemetry data into the appropriate table
        await pool.query(
          "INSERT INTO thermal_data (device_id, timestamp, temperature, voltage, status) VALUES ($1, $2, $3, $4, $5)",
          [json.device_id, json.timestamp, json.temperature, json.voltage, json.status]
        );
        console.log("Inserted telemetry:", json);
      } catch (err) {
        console.error("Invalid telemetry input:", err.message);
      }
    }
  });
});


// DATABASE SETUP - Create tables if they don't exist
app.get("/setup", async (req, res) => {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS thermal_data (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        temperature FLOAT,
        voltage FLOAT,
        status TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS power_data (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        current FLOAT,
        voltage FLOAT,
        status TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attitude_data (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        pitch FLOAT,
        yaw FLOAT,
        roll FLOAT,
        status TEXT
      );
    `);

    res.send("Database setup complete!");
  } catch (err) {
    console.error("Error creating tables:", err.message);
    res.status(500).send("Failed to set up database.");
  }
});

app.get("/", (req, res) => {
  res.send("Telemetry backend API is running.");
});


tcpServer.listen(5001, () => {
  console.log("TCP server listening on port 5001");
});

// Start the REST API server
app.listen(3001, () => {
  console.log("REST API listening on port 3001");
});
