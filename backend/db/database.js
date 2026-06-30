const { Pool } = require("pg");
const bcrypt    = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false },
});

// Helper: run a single query
async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      company       TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      is_admin      INTEGER NOT NULL DEFAULT 0,
      hidden_from_leaderboard INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS bets (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_id    INTEGER NOT NULL,
      home_score  INTEGER NOT NULL,
      away_score  INTEGER NOT NULL,
      updated_at  TEXT NOT NULL DEFAULT '',
      UNIQUE(user_id, match_id)
    );

    CREATE TABLE IF NOT EXISTS results (
      match_id    INTEGER PRIMARY KEY,
      home_score  INTEGER NOT NULL,
      away_score  INTEGER NOT NULL,
      updated_at  TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS match_teams (
      match_id  INTEGER PRIMARY KEY,
      home      TEXT NOT NULL,
      home_code TEXT NOT NULL,
      away      TEXT NOT NULL,
      away_code TEXT NOT NULL
    );
  `);

  // Ensure hidden flag exists for users
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS hidden_from_leaderboard INTEGER NOT NULL DEFAULT 0`);
  await query(`ALTER TABLE match_teams ADD COLUMN IF NOT EXISTS date TEXT`);
  await query(`ALTER TABLE bets ADD COLUMN IF NOT EXISTS penalty_winner TEXT`);
  await query(`ALTER TABLE results ADD COLUMN IF NOT EXISTS penalty_winner TEXT`);

  // Seed admin if no users exist
  const { rows } = await query("SELECT COUNT(*) AS c FROM users");
  if (parseInt(rows[0].c) === 0) {
    const hash = bcrypt.hashSync("admin123", 10);
    await query(
      "INSERT INTO users (email, first_name, last_name, company, password_hash, is_admin, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      ["admin@granotec.com", "Admin", "Granotec", "Granotec", hash, 1, new Date().toISOString()]
    );
    console.log("Admin creado — email: admin@granotec.com, password: admin123 (¡cambialo!)");
  }
}

module.exports = { query, initDB };
