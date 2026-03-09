// routes/auth.js — Register and login endpoints
//
// At login, two separate PBKDF2 operations are performed:
//   1. Verify the master password (compare hash against stored hash)
//   2. Derive an encryption key (used to encrypt/decrypt vault passwords)
//
// The encryption key is embedded in the JWT so it travels with every request.
// The master password is never stored anywhere after this point.

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const JWT_EXPIRES_IN = "24h";

// PBKDF2 settings for password verification (login check)
const HASH_ITERATIONS = 310000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = "sha512";

// PBKDF2 settings for encryption key derivation
// Fewer iterations than hashing — this runs on every login, speed matters more here
// Security comes from the key length and the separate salt
const KEY_ITERATIONS = 100000;
const KEY_KEYLEN = 32; // 32 bytes = 256 bits = AES-256
const KEY_DIGEST = "sha512";
const KEY_SALT_SUFFIX = "_encryption_key"; // appended to salt to make key derivation independent from hash

function pbkdf2(password, salt, iterations, keylen, digest) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, key) => {
      if (err) reject(err);
      else resolve(key.toString("hex"));
    });
  });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const { rows } = await pool.query("SELECT id FROM users LIMIT 1");
    if (rows.length > 0) {
      return res.status(409).json({
        error: "An account already exists. Please log in instead.",
        redirectTo: "/login"
      });
    }

    // Generate salt — used for both password hashing and key derivation
    const salt = crypto.randomBytes(32).toString("hex");

    // Hash the master password for login verification
    const passwordHash = await pbkdf2(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST);

    // Derive encryption key from master password (separate derivation, same salt + suffix)
    const encryptionKey = await pbkdf2(password, salt + KEY_SALT_SUFFIX, KEY_ITERATIONS, KEY_KEYLEN, KEY_DIGEST);

    const result = await pool.query(
      "INSERT INTO users (username, password_hash, salt) VALUES ($1, $2, $3) RETURNING id",
      [username, passwordHash, salt]
    );

    // Embed the encryption key inside the JWT
    // The key is never stored in the database — only in the token
    const token = jwt.sign(
      { userId: result.rows[0].id, username, encryptionKey },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`✅ New user registered: ${username}`);
    res.status(201).json({ token, username });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = rows[0];

    // Step 1 — verify master password
    const hash = await pbkdf2(password, user.salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST);
    if (hash !== user.password_hash) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Step 2 — derive encryption key (same password + salt + suffix)
    const encryptionKey = await pbkdf2(password, user.salt + KEY_SALT_SUFFIX, KEY_ITERATIONS, KEY_KEYLEN, KEY_DIGEST);

    // Embed encryption key in JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, encryptionKey },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`✅ User logged in: ${username}`);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── GET /api/auth/status ─────────────────────────────────────────────────────
router.get("/status", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id FROM users LIMIT 1");
    res.json({ hasAccount: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;