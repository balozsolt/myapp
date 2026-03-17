import React, { useState } from "react";
import { askAI, AIContext } from "../../services/api";
import "./AIAdvisorPanel.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface Props {
  open: boolean;
  context: AIContext | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function AIAdvisorPanel({ open, context, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !context || loading) return;

    const question = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: question }]);
    setLoading(true);

    try {
      const answer = await askAI(question, context);
      setMessages(prev => [...prev, { role: "assistant", text: answer }]);
    } catch (err) {
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
              {context && (
                <span className="ai-context-label">{context.appName}</span>
              )}
            </div>
          </div>
          <button className="panel-close" onClick={handleClose}>✕</button>
        </div>

        {/* ── Messages ── */}
        <div className="ai-messages">
          {messages.length === 0 && (
            <div className="ai-welcome">
              <p>Ask me anything about the security of this account.</p>
              <div className="ai-suggestions">
                <button className="ai-suggestion" onClick={() => setInput("Is this a high risk service?")}>
                  Is this a high risk service?
                </button>
                <button className="ai-suggestion" onClick={() => setInput("How should I secure this account?")}>
                  How should I secure this account?
                </button>
                <button className="ai-suggestion" onClick={() => setInput("Suggest a strong password for this service")}>
                  Suggest a strong password
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
              <p className="ai-message-text ai-typing">Thinking…</p>
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