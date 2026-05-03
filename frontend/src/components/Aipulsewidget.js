// src/components/AIPulseWidget.js
import { useState } from "react";
import api from "../api";

export default function AIPulseWidget({ projects }) {
  const [pulse, setPulse]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError]       = useState("");

  const fetchPulse = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    setPulse(null);
    try {
      const res = await api.get(`/ai/project/${selectedId}/analysis`);
      setPulse(res.data);
    } catch (e) {
      setError("AI service unavailable. Check your Groq API key.");
    } finally {
      setLoading(false);
    }
  };

  const healthColor = (pct) => {
    if (pct >= 70) return "#a6e3a1";
    if (pct >= 30) return "#fab387";
    return "#f38ba8";
  };

  const healthLabel = (pct, spent, budget) => {
    const overBudget = budget > 0 && spent > budget;
    if (overBudget)   return { icon: "🔴", text: "Over Budget" };
    if (pct >= 70)    return { icon: "🟢", text: "Healthy" };
    if (pct >= 30)    return { icon: "🟡", text: "At Risk" };
    return                   { icon: "🔴", text: "Critical" };
  };

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h3 style={s.title}>🧠 AI Project Pulse</h3>
          <p style={s.sub}>Get an AI-generated health report for any project</p>
        </div>
      </div>

      {/* Project selector + button */}
      <div style={s.row}>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={s.select}
        >
          <option value="">— Select a project —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={fetchPulse}
          disabled={!selectedId || loading}
          style={{ ...s.btn, opacity: (!selectedId || loading) ? 0.5 : 1 }}
        >
          {loading ? "⏳ Analyzing..." : "⚡ Generate Pulse"}
        </button>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {/* Result */}
      {pulse && (() => {
        const pct    = pulse.totalTasks > 0
          ? Math.round((pulse.completedTasks / pulse.totalTasks) * 100) : 0;
        const health = healthLabel(pct, pulse.spent, pulse.totalBudget);
        const color  = healthColor(pct);

        return (
          <div style={s.result}>

            {/* Project name + health badge */}
            <div style={s.resultHeader}>
              <span style={s.projectName}>{pulse.projectName}</span>
              <span style={{ ...s.badge, background: color + "22", color }}>
                {health.icon} {health.text}
              </span>
            </div>

            {/* Stats row */}
            <div style={s.statsRow}>
              {[
                { label: "Total Tasks",    value: pulse.totalTasks,      color: "#89b4fa" },
                { label: "Completed",      value: pulse.completedTasks,  color: "#a6e3a1" },
                { label: "In Progress",    value: pulse.inProgressTasks, color: "#fab387" },
                { label: "Pending",        value: pulse.pendingTasks,    color: "#f38ba8" },
              ].map(({ label, value, color }) => (
                <div key={label} style={s.statBox}>
                  <span style={{ color, fontSize: 22, fontWeight: 700 }}>{value}</span>
                  <span style={s.statLabel}>{label}</span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#a6adc8" }}>Task Completion</span>
                <span style={{ fontSize: 12, color, fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={s.track}>
                <div style={{ ...s.fill, width: `${pct}%`, background: color }} />
              </div>
            </div>

            {/* Budget row */}
            {pulse.totalBudget > 0 && (
              <div style={s.budgetRow}>
                <div style={s.budgetItem}>
                  <span style={s.budgetLabel}>Budget</span>
                  <span style={s.budgetValue}>₹{pulse.totalBudget?.toLocaleString()}</span>
                </div>
                <div style={s.budgetItem}>
                  <span style={s.budgetLabel}>Spent</span>
                  <span style={{ ...s.budgetValue, color: "#f38ba8" }}>₹{pulse.spent?.toLocaleString()}</span>
                </div>
                <div style={s.budgetItem}>
                  <span style={s.budgetLabel}>Remaining</span>
                  <span style={{ ...s.budgetValue, color: "#a6e3a1" }}>₹{pulse.remaining?.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* AI Analysis text */}
            <div style={s.analysisBox}>
              <p style={s.analysisLabel}>📊 AI Analysis</p>
              <p style={s.analysisText}>{pulse.aiAnalysis}</p>
            </div>

            {/* Bullet suggestions */}
            {pulse.suggestions?.length > 0 && (
              <div style={s.suggestionsBox}>
                <p style={s.analysisLabel}>💡 Recommendations</p>
                {pulse.suggestions.map((s2, i) => (
                  <div key={i} style={s.suggestion}>{s2}</div>
                ))}
              </div>
            )}

          </div>
        );
      })()}
    </div>
  );
}

const s = {
  card:          { background: "#313244", borderRadius: 12, padding: 24, marginBottom: 24 },
  header:        { marginBottom: 16 },
  title:         { color: "#cdd6f4", fontSize: 18, fontWeight: 700, margin: 0 },
  sub:           { color: "#6c7086", fontSize: 13, margin: "4px 0 0 0" },
  row:           { display: "flex", gap: 12, marginBottom: 12 },
  select:        { flex: 1, background: "#45475a", border: "1px solid #585b70", borderRadius: 8, color: "#cdd6f4", padding: "10px 12px", fontSize: 14 },
  btn:           { background: "#7c6af7", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  error:         { color: "#f38ba8", fontSize: 13, margin: "8px 0" },
  result:        { marginTop: 16, borderTop: "1px solid #45475a", paddingTop: 16 },
  resultHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  projectName:   { color: "#cdd6f4", fontSize: 16, fontWeight: 700 },
  badge:         { fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 },
  statsRow:      { display: "flex", gap: 12, marginBottom: 16 },
  statBox:       { flex: 1, background: "#F5F3FF", borderRadius: 8, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statLabel:     { fontSize: 11, color: "#6c7086", textAlign: "center" },
  track:         { height: 6, background: "#EDE9FE", borderRadius: 3, overflow: "hidden" },
  fill:          { height: "100%", borderRadius: 3, transition: "width 0.5s ease" },
  budgetRow:     { display: "flex", gap: 12, marginBottom: 16 },
  budgetItem:    { flex: 1, background: "#F5F3FF", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 4 },
  budgetLabel:   { fontSize: 11, color: "#6c7086" },
  budgetValue:   { fontSize: 16, fontWeight: 700, color: "#cdd6f4" },
  analysisBox:   { background: "#F5F3FF", borderRadius: 8, padding: 16, marginBottom: 12 },
  analysisLabel: { color: "#cba6f7", fontSize: 12, fontWeight: 700, margin: "0 0 8px 0" },
  analysisText:  { color: "#a6adc8", fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" },
  suggestionsBox:{ background: "#F5F3FF", borderRadius: 8, padding: 16 },
  suggestion:    { color: "#cdd6f4", fontSize: 13, lineHeight: 1.6, padding: "4px 0", borderBottom: "1px solid #31324444" },
};