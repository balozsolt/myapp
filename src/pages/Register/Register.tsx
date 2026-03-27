import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least 1 uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least 1 number", test: (p: string) => /[0-9]/.test(p) },
  { label: "At least 1 special character (!@#$%^&*…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  const ruleResults = rules.map((r) => r.test(password));
  const allRulesMet = ruleResults.every(Boolean);
  const confirmMatches = confirm.length > 0 && confirm === password;
  const canSubmit = allRulesMet && confirmMatches && username.length > 0;

  const handleSubmit = async () => {
    setError("");

    if (!username || !password || !confirm) {
      return setError("All fields are required.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
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
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-eye-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>

            {password.length > 0 && (
              <ul className="pw-rules">
                {rules.map((rule, i) => (
                  <li key={rule.label} className={ruleResults[i] ? "pw-rule pw-rule--met" : "pw-rule pw-rule--unmet"}>
                    {ruleResults[i] ? (
                      <svg className="pw-rule-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg className="pw-rule-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <input
                className="auth-input"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
              />
              <button
                type="button"
                className="auth-eye-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
            {confirm.length > 0 && !confirmMatches && (
              <p className="pw-mismatch">Passwords do not match.</p>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-button"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
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
