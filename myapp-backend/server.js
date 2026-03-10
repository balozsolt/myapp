// server.js — Express app entry point

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "https://myapp-tau-tan.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
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

app.use("/api/auth", authRoutes);
app.use("/api/passwords", authenticate, passwordRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});