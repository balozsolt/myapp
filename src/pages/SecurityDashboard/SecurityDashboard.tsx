import React, { useEffect, useState } from "react";
import { fetchPasswords, PasswordEntry } from "../../services/api";
import { checkAllPasswords } from "../../services/hibp";
import "./SecurityDashboard.css";

interface BreachResult extends PasswordEntry {
  breachCount: number;
  status: "safe" | "breached" | "checking" | "error";
}

function ScoreMeter({ score }: { score: number }) {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const offset = circumference * 0.25 + (arcLength - (arcLength * score) / 100);

  const color =
    score >= 80 ? "#4ade80" :
    score >= 50 ? "#facc15" :
    "#f87171";

  const label =
    score >= 80 ? "Strong" :
    score >= 50 ? "Fair" :
    "At Risk";

  return (
    <div className="score-meter">
      <svg height={radius * 2} width={radius * 2} className="meter-svg">
        <circle
          stroke="rgba(255,255,255,0.06)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transform: "rotate(135deg)", transformOrigin: "50% 50%" }}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transform: "rotate(135deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease",
            filter: `drop-shadow(0 0 8px ${color}88)`,
          }}
        />
      </svg>
      <div className="meter-center">
        <span className="meter-score" style={{ color }}>{score}</span>
        <span className="meter-label" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

function SecurityDashboard() {
  const [results, setResults] = useState<BreachResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Step 1: fetch passwords from the backend (requires JWT)
    fetchPasswords()
      .then((entries) => {
        // Initialise all entries as "checking" while HIBP runs
        setResults(entries.map(e => ({ ...e, breachCount: 0, status: "checking" })));

        // Step 2: check each password against HIBP
        return checkAllPasswords(entries).then((breachMap) => {
          setResults(
            entries.map(e => {
              const count = breachMap.get(e.id) ?? -1;
              return {
                ...e,
                breachCount: count,
                status: count === -1 ? "error" : count > 0 ? "breached" : "safe",
              };
            })
          );
        });
      })
      .catch((err) => {
        console.error("SecurityDashboard fetch failed:", err);
        setError(err.message || "Could not load security data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const total = results.length;
  const breachedCount = results.filter(r => r.status === "breached").length;
  const safeCount = results.filter(r => r.status === "safe").length;
  const score = loading || total === 0 ? 0 : Math.round((safeCount / total) * 100);

  if (error) {
    return (
      <div className="security-dashboard">
        <div className="sd-header">
          <h1 className="sd-title">Security Dashboard</h1>
        </div>
        <div className="error-box">{error}</div>
      </div>
    );
  }

  return (
    <div className="security-dashboard">
      <div className="sd-header">
        <h1 className="sd-title">Security Dashboard</h1>
        {loading && <span className="sd-scanning">Scanning passwords…</span>}
      </div>

      <div className="sd-grid">

        {/* Score card */}
        <div className="sd-card score-card">
          <h2 className="sd-card-title">Security Score</h2>
          <ScoreMeter score={score} />
          <div className="score-stats">
            <div className="score-stat">
              <span className="stat-number safe-color">{safeCount}</span>
              <span className="stat-label">Secure</span>
            </div>
            <div className="score-stat-divider" />
            <div className="score-stat">
              <span className="stat-number breached-color">{breachedCount}</span>
              <span className="stat-label">Breached</span>
            </div>
            <div className="score-stat-divider" />
            <div className="score-stat">
              <span className="stat-number">{total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        {/* Bar chart card */}
        <div className="sd-card chart-card">
          <h2 className="sd-card-title">Password Status</h2>
          <div className="bar-chart">
            {results.map((entry, i) => {
              const isBreached = entry.status === "breached";
              const isChecking = entry.status === "checking";
              return (
                <div key={entry.id} className="bar-row" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="bar-label">
                    <div className="bar-avatar">{entry.appName.charAt(0)}</div>
                    <span>{entry.appName}</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${isBreached ? "bar-breached" : isChecking ? "bar-checking" : "bar-safe"}`}
                      style={{ width: isChecking ? "30%" : "100%" }}
                    />
                  </div>
                  <div className="bar-status">
                    {isChecking ? (
                      <span className="mini-badge checking">···</span>
                    ) : isBreached ? (
                      <span className="mini-badge breached">⚠ Breached</span>
                    ) : (
                      <span className="mini-badge safe">✓ Safe</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breached list — only shown when breaches exist */}
        {!loading && breachedCount > 0 && (
          <div className="sd-card breached-card">
            <h2 className="sd-card-title">⚠ Breached Passwords</h2>
            <p className="breached-subtitle">These passwords have been found in known data breaches. Change them immediately.</p>
            <div className="breached-list">
              {results.filter(r => r.status === "breached").map(entry => (
                <div key={entry.id} className="breached-item">
                  <div className="breached-app">
                    <div className="bar-avatar breached-avatar">{entry.appName.charAt(0)}</div>
                    <div>
                      <div className="breached-name">{entry.appName}</div>
                      <div className="breached-username">{entry.username}</div>
                    </div>
                  </div>
                  <div className="breached-count">
                    {entry.breachCount.toLocaleString()}× exposed
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SecurityDashboard;