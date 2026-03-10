// server.js — Express app entry point

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow requests from local development and the production Vercel frontend.
// In production, ALLOWED_ORIGIN is set as an environment variable in Railway.
const allowedOrigins = [
  "http://localhost:3000",
  process.env.ALLOWED_ORIGIN,
].filter(Boolean); // remove undefined if ALLOWED_ORIGIN is not set

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  }
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
const passwordRoutes = require("./routes/passwords");
const authRoutes = require("./routes/auth");
const authenticate = require("./middleware/authenticate");

// Auth routes are public — no token needed to register or login
app.use("/api/auth", authRoutes);

// Password routes are protected — every request must carry a valid JWT
app.use("/api/passwords", authenticate, passwordRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});