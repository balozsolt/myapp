import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registered = (location.state as { registered?: boolean } | null)?.registered === true;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/status`)
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
      const res = await fetch(`${API_BASE}/api/auth/login`, {
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
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Your master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                type="button"
                className="auth-eye-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {registered && (
            <div className="auth-success">Account created — please log in.</div>
          )}

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