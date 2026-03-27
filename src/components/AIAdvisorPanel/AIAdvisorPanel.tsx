import React, { useState } from "react";
import { askAI, PasswordEntry } from "../../services/api";
import { analyzeVault, VaultAnalysisSummary } from "../../services/vaultAnalysis";
import "./AIAdvisorPanel.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  open: boolean;
  entries: PasswordEntry[];
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function AIAdvisorPanel({ open, entries, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const analysis: VaultAnalysisSummary = await analyzeVault(entries);
      const answer = await askAI(question, analysis);
      setMessages(prev => [...prev, { role: "assistant", text: answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I couldn't get a response. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const handleClose = () => {
    setMessages([]);
    setInput("");
    onClose();
  };

  return (
    <>
      {open && <div className="panel-overlay" onClick={handleClose} />}
      <div className={`side-panel ai-panel ${open ? "side-panel-open" : ""}`}>

        {/* ── Header ── */}
        <div className="panel-header">
          <div className="ai-panel-title">
            <span className="ai-icon">🤖</span>
            <div>
              <h2 className="panel-title">AI Security Advisor</h2>
              <span className="ai-context-label">Vault analysis</span>
            </div>
          </div>
          <button className="panel-close" onClick={handleClose}>✕</button>
        </div>

        {/* ── Messages ── */}
        <div className="ai-messages">
          {messages.length === 0 && (
            <div className="ai-welcome">
              <p>Ask me about the security of your entire vault.</p>
              <div className="ai-suggestions">
                <button className="ai-suggestion" onClick={() => setInput("How secure is my vault?")}>
                  How secure is my vault?
                </button>
                <button className="ai-suggestion" onClick={() => setInput("Do I have any breached passwords?")}>
                  Do I have any breached passwords?
                </button>
                <button className="ai-suggestion" onClick={() => setInput("Which passwords should I change first?")}>
                  Which passwords should I change first?
                </button>
                <button className="ai-suggestion" onClick={() => setInput("How old are my passwords?")}>
                  How old are my passwords?
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ai-message-${msg.role}`}>
              <span className="ai-message-label">
                {msg.role === "user" ? "You" : "AI Advisor"}
              </span>
              <p className="ai-message-text">{msg.text}</p>
            </div>
          ))}

          {loading && (
            <div className="ai-message ai-message-assistant">
              <span className="ai-message-label">AI Advisor</span>
              <p className="ai-message-text ai-typing">Analyzing vault…</p>
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className="ai-input-row">
          <input
            className="ai-input"
            type="text"
            placeholder="Ask a security question…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="ai-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            {loading ? "…" : "Send"}
          </button>
        </div>

      </div>
    </>
  );
}

export default AIAdvisorPanel;
