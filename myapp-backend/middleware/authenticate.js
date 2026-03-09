// middleware/authenticate.js — JWT verification middleware
//
// Verifies the JWT on every protected request.
// Attaches decoded user info AND the encryption key to req.user
// so route handlers can use it for encrypt/decrypt without re-deriving it.

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Decoded contains: { userId, username, encryptionKey, iat, exp }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
}

module.exports = authenticate;