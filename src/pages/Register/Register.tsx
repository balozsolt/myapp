import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If an account already exists, redirect straight to login
  useEffect(() => {
    fetch("http://localhost:3001/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasAccount) navigate("/login", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async () => {
    setError("");

    if (!username || !password || !confirm) {
      return setError("All fields are required.");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) return navigate("/login", { replace: true });
        return setError(data.error || "Registration failed.");
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
          <h1 className="auth-title">Create your vault</h1>
          <p className="auth-subtitle">Set a master password to protect your passwords.</p>
        </div>

        <div className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              type="text"
              placeholder="e.g. zsolti"
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
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating vault…" : "Create vault"}
          </button>
        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;