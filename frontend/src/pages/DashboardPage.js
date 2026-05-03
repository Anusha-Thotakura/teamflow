// src/pages/DashboardPage.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDueMeta(dueDateStr) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return { label: `${Math.abs(diffDays)}d overdue`, color: "#DC2626", urgent: true };
  if (diffDays === 0) return { label: "Due today",          color: "#D97706", urgent: true };
  if (diffDays <= 3)  return { label: `Due in ${diffDays}d`, color: "#D97706", urgent: false };
  return               { label: `Due in ${diffDays}d`,       color: "#7C3AED", urgent: false };
}

function getHealthScore(tasks) {
  if (!tasks || tasks.length === 0) return { label: "No Tasks", color: "#9CA3AF", icon: "⬜", score: 0 };
  const done    = tasks.filter(t => t.status === "DONE").length;
  const overdue = tasks.filter(t => getDueMeta(t.dueDate)?.urgent && t.status !== "DONE").length;
  const pct     = Math.round((done / tasks.length) * 100);
  if (overdue > 0 && pct < 30) return { label: "Critical", color: "#DC2626", icon: "🔴", score: pct };
  if (pct >= 70)               return { label: "Healthy",  color: "#059669", icon: "🟢", score: pct };
  return                               { label: "At Risk",  color: "#D97706", icon: "🟡", score: pct };
}

const FILTERS = ["ALL", "TODO", "IN_PROGRESS", "DONE"];
const priorityColor = { HIGH: "#DC2626", MEDIUM: "#D97706", LOW: "#059669" };
const statusColor   = { DONE: "#059669", IN_PROGRESS: "#7C3AED", TODO: "#6B7280" };

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { userEmail } = useAuth();
  const role          = localStorage.getItem("role");
  const navigate      = useNavigate();

  const [myTasks,    setMyTasks]    = useState([]);
  const [projects,   setProjects]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { load(); }, [role]);

  const load = async () => {
    try {
      const [taskRes, projRes] = await Promise.all([
        api.get("/tasks/me"),
        role === "ROLE_ADMIN" ? api.get("/projects/all") : api.get("/projects"),
      ]);
      setMyTasks(taskRes.data);
      setProjects(projRes.data);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  // ── Feature 1: Status change from dashboard ──────────────────────────────
  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      await api.put(`/tasks/${taskId}/status?status=${newStatus}`);
      setMyTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
    } catch (e) { console.error(e); }
    finally     { setUpdatingId(null); }
  };

  const nextStatus = { TODO: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: "TODO" };
  const nextLabel  = { TODO: "▶ Start",     IN_PROGRESS: "✓ Done", DONE: "↩ Reopen" };

  // ── Feature 3: Filter ────────────────────────────────────────────────────
  const filteredTasks = filter === "ALL"
    ? myTasks
    : myTasks.filter(t => t.status === filter);

  const done       = myTasks.filter(t => t.status === "DONE").length;
  const inProgress = myTasks.filter(t => t.status === "IN_PROGRESS").length;
  const todo       = myTasks.filter(t => t.status === "TODO").length;
  const overdue    = myTasks.filter(t => getDueMeta(t.dueDate)?.urgent && t.status !== "DONE").length;

  if (loading) return <div style={s.loading}>Loading dashboard...</div>;

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.welcome}>Good day, {userEmail?.split("@")[0]} 👋</h1>
          <p style={s.sub}>
            {overdue > 0
              ? `⚠️ You have ${overdue} overdue task${overdue > 1 ? "s" : ""} — let's get those done!`
              : "Here's your TeamFlow overview"}
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={s.statsRow}>
        {[
          { label: "My Tasks",    value: myTasks.length,  color: "#7C3AED", bg: "#EDE9FE", icon: "📋" },
          { label: "Completed",   value: done,            color: "#059669", bg: "#D1FAE5", icon: "✅" },
          { label: "In Progress", value: inProgress,      color: "#D97706", bg: "#FEF3C7", icon: "⚡" },
          { label: "Pending",     value: todo,            color: "#DC2626", bg: "#FEE2E2", icon: "🕐" },
          { label: "Projects",    value: projects.length, color: "#6D28D9", bg: "#F5F3FF", icon: "📁" },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{ ...s.statCard, background: bg, border: `1px solid ${color}22` }}>
            <span style={s.statIcon}>{icon}</span>
            <span style={{ ...s.statValue, color }}>{value}</span>
            <span style={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>

        {/* ── My Tasks ── */}
        <div style={s.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={s.sectionTitle}>My Tasks</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  ...s.filterBtn,
                  background: filter === f ? "#7C3AED"  : "#EDE9FE",
                  color:      filter === f ? "#fff"     : "#7C3AED",
                  border:     filter === f ? "1px solid #7C3AED" : "1px solid #DDD6FE",
                }}>
                  {f === "IN_PROGRESS" ? "IN PROG" : f}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0
            ? <p style={s.empty}>No {filter !== "ALL" ? filter.replace("_", " ") : ""} tasks.</p>
            : filteredTasks.slice(0, 6).map(task => {
                const due  = getDueMeta(task.dueDate);
                const busy = updatingId === task.id;
                return (
                  <div key={task.id} style={{
                    ...s.taskCard,
                    borderLeft: `3px solid ${due?.urgent ? due.color : "#A78BFA"}`,
                  }}>
                    <div style={s.taskTop}>
                      <span style={s.taskTitle}>{task.title}</span>
                      <span style={{
                        ...s.badge,
                        background: priorityColor[task.priority] + "18",
                        color:      priorityColor[task.priority],
                      }}>
                        {task.priority}
                      </span>
                    </div>

                    <div style={s.taskBottom}>
                      {due && (
                        <span style={{ fontSize: 11, color: due.color, fontWeight: due.urgent ? 700 : 400 }}>
                          {due.urgent ? "⚠️ " : "📅 "}{due.label}
                        </span>
                      )}
                      <span style={{
                        ...s.badge,
                        background: statusColor[task.status] + "18",
                        color:      statusColor[task.status],
                      }}>
                        {task.status?.replace("_", " ")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStatusChange(task.id, nextStatus[task.status])}
                      disabled={busy}
                      style={{
                        ...s.statusBtn,
                        background: task.status === "DONE" ? "#F3F4F6" : "#EDE9FE",
                        color:      task.status === "DONE" ? "#9CA3AF" : "#7C3AED",
                        border:     task.status === "DONE" ? "1px solid #E5E7EB" : "1px solid #DDD6FE",
                        opacity:    busy ? 0.6 : 1,
                      }}
                    >
                      {busy ? "..." : nextLabel[task.status]}
                    </button>
                  </div>
                );
              })
          }
        </div>

        {/* ── Projects ── */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>My Projects</h2>
          {projects.length === 0
            ? <p style={s.empty}>No projects yet. Create one!</p>
            : projects.slice(0, 5).map(project => {
                const projectTasks = myTasks.filter(t => t.projectName === project.name);
                const health       = getHealthScore(projectTasks);
                const donePct      = health.score;

                return (
                  <div key={project.id} style={s.projectCard} onClick={() => navigate(`/projects/${project.id}`)}>
                    <div style={s.projectTop}>
                      <span style={s.projectName}>{project.name}</span>
                      <span style={{
                        ...s.badge,
                        background: health.color + "18",
                        color:      health.color,
                        fontSize:   11,
                      }}>
                        {health.icon} {health.label}
                      </span>
                    </div>

                    <div style={s.progressTrack}>
                      <div style={{ ...s.progressFill, width: `${donePct}%`, background: health.color }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>
                        💰 ₹{project.budget?.toLocaleString() || "N/A"}
                      </span>
                      <span style={{ fontSize: 11, color: health.color, fontWeight: 600 }}>
                        {donePct}% complete
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "#6B7280" }}>
                      👥 {project.memberEmails?.length || 0} members
                    </div>
                  </div>
                );
              })
          }
          <button style={s.viewAll} onClick={() => navigate("/projects")}>
            View All Projects →
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  loading:      { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#4C1D95", fontSize: 18, background: "#F5F3FF" },
  page:         { minHeight: "100vh", background: "#ffffff", padding: "32px", color: "#1F1344", fontFamily: "sans-serif" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  welcome:      { fontSize: 28, fontWeight: 700, color: "#1F1344", margin: 0 },
  sub:          { color: "#7C6FA0", margin: "4px 0 0 0", fontSize: 14 },
  statsRow:     { display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" },
  statCard:     { flex: "1 1 140px", borderRadius: 14, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  statIcon:     { fontSize: 24 },
  statValue:    { fontSize: 32, fontWeight: 700 },
  statLabel:    { fontSize: 13, color: "#7C6FA0" },
  twoCol:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  section:      { background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #EDE9FE", boxShadow: "0 1px 4px rgba(109,40,217,0.06)" },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: "#1F1344", margin: 0 },
  empty:        { color: "#9CA3AF", fontSize: 14 },
  taskCard:     { background: "#FAFAFA", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #EDE9FE" },
  taskTop:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  taskTitle:    { fontSize: 14, fontWeight: 500, color: "#1F1344" },
  taskBottom:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  badge:        { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 },
  filterBtn:    { fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, cursor: "pointer" },
  statusBtn:    { width: "100%", padding: "6px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "opacity 0.2s" },
  projectCard:  { background: "#FAFAFA", borderRadius: 10, padding: "14px", marginBottom: 10, cursor: "pointer", border: "1px solid #EDE9FE", transition: "box-shadow 0.2s" },
  projectTop:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  projectName:  { fontSize: 14, fontWeight: 600, color: "#1F1344" },
  progressTrack:{ height: 5, background: "#EDE9FE", borderRadius: 3, marginBottom: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, transition: "width 0.5s ease" },
  viewAll:      { marginTop: 12, background: "transparent", border: "1px solid #DDD6FE", color: "#7C3AED", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, width: "100%", fontWeight: 500 },
};