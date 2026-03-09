// routes/passwords.js — Password CRUD with AES-256-GCM encryption
//
// Every password is encrypted before being stored in PostgreSQL.
// Every password is decrypted after being fetched from PostgreSQL.
//
// Algorithm: AES-256-GCM
//   - 256-bit key (derived from master password, passed via JWT)
//   - GCM mode provides authenticated encryption — detects tampering
//   - Random IV (initialisation vector) generated per encryption operation
//   - IV and auth tag are stored alongside the ciphertext
//
// Stored format in DB: "iv:authTag:ciphertext" (all hex encoded, colon separated)

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const pool = require("../db");

const ALGORITHM = "aes-256-gcm";

// ─── Encryption helpers ───────────────────────────────────────────────────────

function encrypt(plaintext, keyHex) {
  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(16); // fresh random IV every time
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag(); // GCM authentication tag

  // Store as "iv:authTag:ciphertext" so we can decrypt later
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(stored, keyHex) {
  const [ivHex, authTagHex, ciphertextHex] = stored.split(":");
  const key = Buffer.from(keyHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// ─── Response helper ──────────────────────────────────────────────────────────

function toResponse(row, keyHex) {
  return {
    id:        row.id,
    appName:   row.app_name,
    url:       row.url,
    username:  row.username,
    password:  decrypt(row.password, keyHex), // decrypt before sending to frontend
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── GET /api/passwords ───────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const { encryptionKey } = req.user;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM passwords ORDER BY app_name ASC"
    );
    res.json(rows.map(row => toResponse(row, encryptionKey)));
  } catch (err) {
    console.error("GET /api/passwords error:", err);
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});

// ─── POST /api/passwords ──────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { appName, url, username, password } = req.body;
  const { encryptionKey } = req.user;

  if (!appName || !url || !username || !password) {
    return res.status(400).json({
      error: "All fields are required: appName, url, username, password"
    });
  }

  try {
    const encryptedPassword = encrypt(password, encryptionKey);

    const { rows } = await pool.query(
      `INSERT INTO passwords (app_name, url, username, password)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [appName, url, username, encryptedPassword]
    );
    res.status(201).json(toResponse(rows[0], encryptionKey));
  } catch (err) {
    console.error("POST /api/passwords error:", err);
    res.status(500).json({ error: "Failed to create password" });
  }
});

// ─── PUT /api/passwords/:id ───────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { appName, url, username, password } = req.body;
  const { encryptionKey } = req.user;

  if (!appName || !url || !username || !password) {
    return res.status(400).json({
      error: "All fields are required: appName, url, username, password"
    });
  }

  try {
    const encryptedPassword = encrypt(password, encryptionKey);

    const { rows } = await pool.query(
      `UPDATE passwords
       SET app_name = $1, url = $2, username = $3, password = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [appName, url, username, encryptedPassword, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `Password with id ${id} not found` });
    }

    res.json(toResponse(rows[0], encryptionKey));
  } catch (err) {
    console.error(`PUT /api/passwords/${id} error:`, err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ─── DELETE /api/passwords/:id ────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      "DELETE FROM passwords WHERE id = $1 RETURNING id",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `Password with id ${id} not found` });
    }

    res.json({ message: `Password ${id} deleted successfully` });
  } catch (err) {
    console.error(`DELETE /api/passwords/${id} error:`, err);
    res.status(500).json({ error: "Failed to delete password" });
  }
});

module.exports = router;