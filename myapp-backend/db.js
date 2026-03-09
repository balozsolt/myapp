// db.js — PostgreSQL connection pool and table initialisation
//
// Uses the 'pg' package (node-postgres) — the standard PostgreSQL client for Node.js.
// A connection pool is used instead of a single connection — this means multiple
// requests can query the database simultaneously without waiting for each other.
//
// Connection details match the docker-compose.yml configuration.

const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || "myapp",
  password: process.env.DB_PASSWORD || "myapp123",
  database: process.env.DB_NAME     || "myapp_vault",
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    return;
  }
  release();
  console.log("✅ Connected to PostgreSQL");
  initialiseDatabase();
});

// Create tables and seed data if needed
async function initialiseDatabase() {
  try {
    // Create passwords table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS passwords (
        id          SERIAL PRIMARY KEY,
        app_name    TEXT NOT NULL,
        url         TEXT NOT NULL,
        username    TEXT NOT NULL,
        password    TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        username      TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        salt          TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    console.log("✅ Database tables ready.");
  } catch (err) {
    console.error("❌ Database initialisation failed:", err.message);
  }
}

module.exports = pool;