import React, { useState, useEffect } from "react";
import {
  fetchPasswords,
  createPassword,
  updatePassword,
  deletePassword,
  PasswordEntry,
  AIContext,
} from "../../services/api";
import { checkAllPasswords } from "../../services/hibp";
import AIAdvisorPanel from "../../components/AIAdvisorPanel/AIAdvisorPanel";
import "./AllItems.css";

// ─── Icons ────────────────────────────────────────────────────────────────────

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  appName: string;
  url: string;
  username: string;
  password: string;
};

const emptyForm: FormData = { appName: "", url: "", username: "", password: "" };

// ─── Component ────────────────────────────────────────────────────────────────

function AllItems() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [breachCounts, setBreachCounts] = useState<Map<number, number>>(new Map());
  const [checkingBreaches, setCheckingBreaches] = useState(false);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [panelPasswordVisible, setPanelPasswordVisible] = useState(false);

  // AI panel state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiContext, setAiContext] = useState<AIContext | null>(null);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const loadPasswords = () => {
    fetchPasswords()
      .then((data) => {
        setEntries(data);
        setLoading(false);
        if (data.length > 0) {
          setCheckingBreaches(true);
          checkAllPasswords(data)
            .then((results) => setBreachCounts(results))
            .catch((err) => console.error("Breach check failed:", err))
            .finally(() => setCheckingBreaches(false));
        }
      })
      .catch((err) => {
        setError(err.message || "Could not load passwords.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPasswords();
  }, []);

  // ─── Panel helpers ──────────────────────────────────────────────────────────

  const openAddPanel = () => {
    setEditingEntry(null);
    setFormData(emptyForm);
    setFormError("");
    setPanelPasswordVisible(false);
    setPanelOpen(true);
  };

  const openEditPanel = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setFormData({
      appName:  entry.appName,
      url:      entry.url,
      username: entry.username,
      password: entry.password,
    });
    setFormError("");
    setPanelPasswordVisible(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingEntry(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const openAIPanel = (entry: PasswordEntry) => {
    setAiContext({ appName: entry.appName, url: entry.url, username: entry.username });
    setAiPanelOpen(true);
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setFormError("");

    if (!formData.appName || !formData.url || !formData.username || !formData.password) {
      return setFormError("All fields are required.");
    }

    setSaving(true);
    try {
      if (editingEntry) {
        const updated = await updatePassword(editingEntry.id, formData);
        setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        const created = await createPassword(formData);
        setEntries(prev => [...prev, created].sort((a, b) => a.appName.localeCompare(b.appName)));
      }
      closePanel();
    } catch (err: any) {
      setFormError(err.message || "Failed to save password.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete helpers ─────────────────────────────────────────────────────────

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async (id: number) => {
    setDeletingId(id);
    try {
      await deletePassword(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setBreachCounts(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  // ─── Other helpers ──────────────────────────────────────────────────────────

  const togglePassword = (id: number) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="all-items">
        <div className="all-items-header">
          <h1 className="all-items-title">All Items</h1>
          <span className="checking-badge">Loading…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-items">
        <div className="all-items-header">
          <h1 className="all-items-title">All Items</h1>
        </div>
        <div className="error-box">{error}</div>
      </div>
    );
  }

  return (
    <div className="all-items">

      {/* ── Header ── */}
      <div className="all-items-header">
        <div className="header-left">
          <h1 className="all-items-title">All Items</h1>
          <span className="all-items-count">{entries.length} entries</span>
          {checkingBreaches && <span className="checking-badge">Checking breaches…</span>}
        </div>
        <button className="add-btn" onClick={openAddPanel}>+ Add password</button>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table className="password-table">
          <thead>
            <tr>
              <th>Application</th>
              <th>URL</th>
              <th>Username</th>
              <th>Password</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isVisible = visiblePasswords.has(entry.id);
              const usernameCopied = copiedField === `username-${entry.id}`;
              const passwordCopied = copiedField === `password-${entry.id}`;
              const breachCount = breachCounts.get(entry.id);
              const isBreached = breachCount !== undefined && breachCount > 0;
              const isChecking = checkingBreaches || breachCount === undefined;
              const isConfirmingDelete = deleteConfirmId === entry.id;
              const isDeleting = deletingId === entry.id;

              return (
                <tr key={entry.id} className={isBreached ? "row-breached" : ""}>
                  <td>
                    <div className="app-name-cell">
                      <div className="app-avatar">{entry.appName.charAt(0)}</div>
                      <span>{entry.appName}</span>
                    </div>
                  </td>
                  <td>
                    <a href={entry.url} target="_blank" rel="noreferrer" className="url-link">
                      {entry.url}
                    </a>
                  </td>
                  <td>
                    <div className="field-cell">
                      <span className="field-value">{entry.username}</span>
                      <button
                        className={`icon-btn ${usernameCopied ? "copied" : ""}`}
                        onClick={() => copyToClipboard(entry.username, `username-${entry.id}`)}
                        title="Copy username"
                      >
                        {usernameCopied ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="field-cell">
                      <span className="field-value password-value">
                        {isVisible ? entry.password : "••••••••••••"}
                      </span>
                      <button className="icon-btn" onClick={() => togglePassword(entry.id)} title={isVisible ? "Hide" : "Show"}>
                        <EyeIcon open={isVisible} />
                      </button>
                      <button
                        className={`icon-btn ${passwordCopied ? "copied" : ""}`}
                        onClick={() => copyToClipboard(entry.password, `password-${entry.id}`)}
                        title="Copy password"
                      >
                        {passwordCopied ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </td>
                  <td>
                    {isChecking ? (
                      <span className="status-badge checking">···</span>
                    ) : isBreached ? (
                      <span className="status-badge breached" title={`Seen ${breachCount?.toLocaleString()} times`}>
                        ⚠ Breached
                      </span>
                    ) : (
                      <span className="status-badge safe">✓ Safe</span>
                    )}
                  </td>
                  <td>
                    <div className="action-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => openEditPanel(entry)}
                        title="Edit"
                      >
                        Edit
                      </button>

                      {/* ── Ask AI button ── */}
                      <button
                        className="action-btn ai-btn"
                        onClick={() => openAIPanel(entry)}
                        title="Ask AI"
                      >
                        Ask AI
                      </button>

                      {isConfirmingDelete ? (
                        <div className="delete-confirm">
                          <span className="delete-confirm-text">Sure?</span>
                          <button
                            className="action-btn confirm-yes-btn"
                            onClick={() => handleDeleteConfirm(entry.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "…" : "Yes"}
                          </button>
                          <button
                            className="action-btn confirm-no-btn"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteClick(entry.id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Slide-in panel overlay ── */}
      {panelOpen && (
        <div className="panel-overlay" onClick={closePanel} />
      )}

      {/* ── Slide-in panel ── */}
      <div className={`side-panel ${panelOpen ? "side-panel-open" : ""}`}>
        <div className="panel-header">
          <h2 className="panel-title">
            {editingEntry ? "Edit password" : "Add password"}
          </h2>
          <button className="panel-close" onClick={closePanel}>✕</button>
        </div>

        <div className="panel-form">
          <div className="panel-field">
            <label className="panel-label">Application name</label>
            <input
              className="panel-input"
              type="text"
              placeholder="e.g. GitHub"
              value={formData.appName}
              onChange={e => handleFormChange("appName", e.target.value)}
              autoFocus
            />
          </div>

          <div className="panel-field">
            <label className="panel-label">URL</label>
            <input
              className="panel-input"
              type="text"
              placeholder="e.g. https://github.com"
              value={formData.url}
              onChange={e => handleFormChange("url", e.target.value)}
            />
          </div>

          <div className="panel-field">
            <label className="panel-label">Username</label>
            <input
              className="panel-input"
              type="text"
              placeholder="e.g. zsolti_dev"
              value={formData.username}
              onChange={e => handleFormChange("username", e.target.value)}
            />
          </div>

          <div className="panel-field">
            <label className="panel-label">Password</label>
            <div className="panel-password-wrapper">
              <input
                className="panel-input panel-password-input"
                type={panelPasswordVisible ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={e => handleFormChange("password", e.target.value)}
              />
              <button
                className="panel-eye-btn"
                onClick={() => setPanelPasswordVisible(v => !v)}
                title={panelPasswordVisible ? "Hide password" : "Show password"}
                type="button"
              >
                <EyeIcon open={panelPasswordVisible} />
              </button>
            </div>
          </div>

          {formError && (
            <div className="panel-error">{formError}</div>
          )}

          <div className="panel-actions">
            <button className="panel-cancel" onClick={closePanel}>
              Cancel
            </button>
            <button
              className="panel-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : editingEntry ? "Save changes" : "Add password"}
            </button>
          </div>
        </div>
      </div>

      {/* ── AI Advisor Panel ── */}
      <AIAdvisorPanel
        open={aiPanelOpen}
        context={aiContext}
        onClose={() => setAiPanelOpen(false)}
      />

    </div>
  );
}

export default AllItems;