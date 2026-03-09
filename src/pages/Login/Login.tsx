import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, skip straight to the app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  // If no account exists yet, send to register
  useEffect(() => {
    fetch("http://localhost:3001/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.hasAccount) navigate("/register", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async () => {
    setError("");

    if (!username || !password) {
      return setError("Please enter your username and password.");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || "Login failed.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      navigate("/", { replace: true });
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🔐</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Enter your master password to unlock your vault.</p>
        </div>

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Master Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Your master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Unlocking…" : "Unlock vault"}
          </button>
        </div>

        <p className="auth-footer">
          No account yet?{" "}
          <span className="auth-link" onClick={() => navigate("/register")}>
            Create one
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;