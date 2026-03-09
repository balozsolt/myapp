// server.js — Express app entry point

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));
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