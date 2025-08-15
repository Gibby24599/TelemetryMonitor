// db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'db',
  password: process.env.DB_PASSWORD || 'password',
  port: 5432,
});

module.exports = pool;
