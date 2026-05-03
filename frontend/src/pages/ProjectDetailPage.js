// src/pages/ProjectDetailPage.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

const TAB = { TASKS: "tasks", MEMBERS: "members" };

export default function ProjectDetailPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memberUsers, setMemberUsers] = useState([]); // { id, email, name }
  const [activeTab, setActiveTab] = useState(TAB.TASKS);
  const [loading, setLoading] = useState(true);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMsg, setMemberMsg] = useState({ text: "", type: "" });
  const [taskMsg, setTaskMsg] = useState({ text: "", type: "" });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToUserId: ""
  });

  const role = localStorage.getItem("role");
  const email = localStorage.getItem("userEmail");
  const isAdmin = role === "ROLE_ADMIN";
  const isOwner = project?.ownerEmail === email;
  const canManage = isAdmin || isOwner;

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/users`),
      ]);
      const proj = projRes.data;
      setProject(proj);
      setTasks(taskRes.data);
      const allUsers = usersRes.data;
      const projectMemberEmails = [proj.ownerEmail, ...(proj.memberEmails || [])];
      setMemberUsers(allUsers.filter(u => projectMemberEmails.includes(u.email)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskMsg({ text: "", type: "" });
    try {
      await api.post("/tasks", {
        ...taskForm,
        projectId: Number(id),
        assignedToUserId: taskForm.assignedToUserId ? Number(taskForm.assignedToUserId) : null,
        dueDate: taskForm.dueDate || null,
      });
      setTaskForm({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToUserId: "" });
      setShowTaskForm(false);
      setTaskMsg({ text: "Task created successfully!", type: "success" });
      loadAll();
    } catch (e) {
      setTaskMsg({ text: "Failed to create task.", type: "error" });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${taskId}`);
    loadAll();
  };

  const handleUpdateStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}/status?status=${status}`);
    loadAll();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberMsg({ text: "", type: "" });
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail("");
      setMemberMsg({ text: "Member added successfully!", type: "success" });
      loadAll();
    } catch (err) {
      setMemberMsg({ text: err.response?.data?.error || "Failed to add member.", type: "error" });
    }
  };

  const handleRemoveMember = async (m) => {
    if (!window.confirm(`Remove ${m} from project?`)) return;
    await api.delete(`/projects/${id}/members`, { data: { email: m } });
    loadAll();
  };

  if (loading) return <div style={s.loading}>Loading project...</div>;
  if (!project) return <div style={s.loading}>Project not found.</div>;

  const done = tasks.filter(t => t.status === "DONE").length;
  const inProgress = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter(t => t.status === "TODO").length;
  const progressPct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  const priorityColor = { HIGH: "#f38ba8", MEDIUM: "#fab387", LOW: "#a6e3a1" };
  const statusColor = { DONE: "#a6e3a1", IN_PROGRESS: "#89b4fa", TODO: "#6c7086" };
  const statusBg = { DONE: "#a6e3a122", IN_PROGRESS: "#89b4fa22", TODO: "#6c708622" };

  return (
    <div style={s.page}>

      {/* ── Project Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.projectIcon}>📁</div>
          <div>
            <h1 style={s.projectName}>{project.name}</h1>
            {project.description && <p style={s.projectDesc}>{project.description}</p>}
            <div style={s.metaRow}>
              <span style={s.metaChip}>👤 {project.ownerEmail}</span>
              <span style={s.metaChip}>👥 {project.memberEmails?.length || 0} members</span>
              {project.budget && (
                <span style={{ ...s.metaChip, color: "#a6e3a1" }}>
                  💰 ₹{project.budget.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={s.progressBox}>
          <div style={s.progressLabel}>
            <span style={{ color: "#1F1344", fontSize: 13 }}>Progress</span>
            <span style={{ color: "#a6e3a1", fontWeight: 700 }}>{progressPct}%</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${progressPct}%` }} />
          </div>
          <div style={s.statsRow}>
            {[
              { label: "Todo", value: todo, color: "#6c7086" },
              { label: "In Progress", value: inProgress, color: "#89b4fa" },
              { label: "Done", value: done, color: "#a6e3a1" },
            ].map(st => (
              <div key={st.label} style={s.statItem}>
                <span style={{ color: st.color, fontWeight: 700, fontSize: 18 }}>{st.value}</span>
                <span style={{ color: "#6c7086", fontSize: 11 }}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={s.tabBar}>
        {[
          { key: TAB.TASKS, label: `📋 Tasks (${tasks.length})` },
          { key: TAB.MEMBERS, label: `👥 Members (${project.memberEmails?.length || 0})` },
        ].map(t => (
          <button
            key={t.key}
            style={{ ...s.tab, ...(activeTab === t.key ? s.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TASKS TAB ── */}
      {activeTab === TAB.TASKS && (
        <div>
          {/* Notification */}
          {taskMsg.text && (
            <div style={{
              ...s.msg,
              backgroundColor: taskMsg.type === "success" ? "#a6e3a122" : "#f38ba822",
              color: taskMsg.type === "success" ? "#a6e3a1" : "#f38ba8",
              borderLeft: `4px solid ${taskMsg.type === "success" ? "#a6e3a1" : "#f38ba8"}`,
            }}>
              {taskMsg.text}
            </div>
          )}

          {/* Add Task Button */}
          {canManage && (
            <div style={{ marginBottom: 20 }}>
              <button style={s.addBtn} onClick={() => setShowTaskForm(!showTaskForm)}>
                {showTaskForm ? "✕ Cancel" : "+ Add Task"}
              </button>
            </div>
          )}

          {/* Task Form */}
          {showTaskForm && canManage && (
            <div style={s.formCard}>
              <h3 style={s.formTitle}>Create New Task</h3>
              <form onSubmit={handleCreateTask}>
                <div style={s.formGrid}>
                  <div style={s.field}>
                    <label style={s.label}>Task Title *</label>
                    <input
                      placeholder="e.g. Design homepage mockup"
                      value={taskForm.title}
                      onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                      style={s.input}
                      required
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                      style={s.input}
                    >
                      <option value="HIGH">🔴 High</option>
                      <option value="MEDIUM">🟠 Medium</option>
                      <option value="LOW">🟢 Low</option>
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      style={s.input}
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Assign To</label>
                    <select
                      value={taskForm.assignedToUserId}
                      onChange={e => setTaskForm({ ...taskForm, assignedToUserId: e.target.value })}
                      style={s.input}
                    >
                      <option value="">-- Select Member --</option>
                      {memberUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name ? `${u.name} (${u.email})` : u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ ...s.field, gridColumn: "1 / -1" }}>
                    <label style={s.label}>Description</label>
                    <textarea
                      placeholder="Task details..."
                      value={taskForm.description}
                      onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                      style={{ ...s.input, minHeight: 70, resize: "vertical" }}
                    />
                  </div>
                </div>
                <button type="submit" style={s.submitBtn}>✓ Create Task</button>
              </form>
            </div>
          )}

          {/* Task List */}
          {tasks.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: "#1F1344", fontSize: 16 }}>No tasks yet.</p>
              <p style={{ color: "#6c7086", fontSize: 13 }}>Click "+ Add Task" to create the first one.</p>
            </div>
          ) : (
            <div style={s.taskList}>
              {tasks.map(task => (
                <div key={task.id} style={s.taskCard}>
                  <div style={s.taskLeft}>
                    {/* Priority dot */}
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      backgroundColor: priorityColor[task.priority],
                      flexShrink: 0, marginTop: 4,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={s.taskTitle}>{task.title}</div>
                      {task.description && <div style={s.taskDesc}>{task.description}</div>}
                      <div style={s.taskMeta}>
                        {task.dueDate && <span>📅 {task.dueDate}</span>}
                        {task.assignedTo && <span>👤 {task.assignedTo}</span>}
                        <span style={{
                          backgroundColor: priorityColor[task.priority] + "22",
                          color: priorityColor[task.priority],
                          padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        }}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={s.taskRight}>
                    {/* Status Selector */}
                    <select
                      value={task.status}
                      onChange={e => handleUpdateStatus(task.id, e.target.value)}
                      disabled={task.assignedTo !== email && !isAdmin}
                      style={{
                        ...s.statusSelect,
                        backgroundColor: statusBg[task.status],
                        color: statusColor[task.status],
                        borderColor: statusColor[task.status] + "44",
                      }}
                    >
                      <option value="TODO">📌 TODO</option>
                      <option value="IN_PROGRESS">⚡ IN PROGRESS</option>
                      <option value="DONE">✅ DONE</option>
                    </select>

                    {/* Delete (admin only) */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        style={s.deleteBtn}
                        title="Delete task"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {activeTab === TAB.MEMBERS && (
        <div>
          {memberMsg.text && (
            <div style={{
              ...s.msg,
              backgroundColor: memberMsg.type === "success" ? "#a6e3a122" : "#f38ba822",
              color: memberMsg.type === "success" ? "#a6e3a1" : "#f38ba8",
              borderLeft: `4px solid ${memberMsg.type === "success" ? "#a6e3a1" : "#f38ba8"}`,
            }}>
              {memberMsg.text}
            </div>
          )}

          {/* Add Member Form */}
          {canManage && (
            <div style={s.formCard}>
              <h3 style={s.formTitle}>Add Team Member</h3>
              <form onSubmit={handleAddMember} style={{ display: "flex", gap: 12 }}>
                <input
                  type="email"
                  placeholder="teammate@company.com"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  style={{ ...s.input, flex: 1 }}
                  required
                />
                <button type="submit" style={s.submitBtn}>+ Add</button>
              </form>
            </div>
          )}

          {/* Members List */}
          <div style={s.formCard}>
            <h3 style={s.formTitle}>Members ({project.memberEmails?.length || 0})</h3>
            {(!project.memberEmails || project.memberEmails.length === 0) ? (
              <p style={{ color: "#6c7086", fontSize: 14 }}>No members added yet.</p>
            ) : (
              project.memberEmails.map(m => (
                <div key={m} style={s.memberRow}>
                  <div style={s.memberAvatar}>{m[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#1F1344", fontSize: 14, fontWeight: 500 }}>{m}</div>
                    <div style={{ color: "#6c7086", fontSize: 12 }}>
                      {m === project.ownerEmail ? "👑 Owner" : "Member"}
                    </div>
                  </div>
                  {canManage && m !== project.ownerEmail && (
                    <button onClick={() => handleRemoveMember(m)} style={s.removeBtn}>
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px", backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "sans-serif" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#1F1344", fontSize: 18, background: "#ffffff" },

  // Header
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: 28, backgroundColor: "#F5F3FF", borderRadius: 16, padding: 28, flexWrap: "wrap" },
  headerLeft: { display: "flex", gap: 16, alignItems: "flex-start", flex: 1 },
  projectIcon: { fontSize: 40, lineHeight: 1 },
  projectName: { color: "#1F1344", fontSize: 26, fontWeight: 700, margin: "0 0 4px" },
  projectDesc: { color: "#6B7280", fontSize: 14, margin: "0 0 10px", lineHeight: 1.5 },
  metaRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  metaChip: { backgroundColor: "#EDE9FE", color: "#4C1D95", padding: "4px 12px", borderRadius: 20, fontSize: 12 },

  // Progress
  progressBox: { minWidth: 180, backgroundColor: "#F5F3FF", borderRadius: 12, padding: "16px 20px" },
  progressLabel: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  progressTrack: { backgroundColor: "#EDE9FE", borderRadius: 99, height: 8, marginBottom: 12 },
  progressFill: { backgroundColor: "#a6e3a1", height: 8, borderRadius: 99, transition: "width 0.5s" },
  statsRow: { display: "flex", gap: 16, justifyContent: "space-between" },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },

  // Tabs
  tabBar: { display: "flex", gap: 8, marginBottom: 24 },
  tab: { padding: "10px 20px", borderRadius: 8, border: "1px solid #EDE9FE", backgroundColor: "transparent", color: "#7C6FA0", cursor: "pointer", fontSize: 14, fontWeight: 500 },
  tabActive: { backgroundColor: "#7c6af7", color: "#fff", border: "1px solid #7c6af7" },

  // Messages
  msg: { padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 },

  // Buttons
  addBtn: { padding: "10px 20px", backgroundColor: "#7c6af7", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  submitBtn: { padding: "10px 20px", backgroundColor: "#7C3AED", color: "#ffffff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" },
  deleteBtn: { padding: "6px 10px", backgroundColor: "#f38ba822", color: "#f38ba8", border: "1px solid #f38ba844", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  removeBtn: { padding: "4px 12px", backgroundColor: "#f38ba822", color: "#f38ba8", border: "1px solid #f38ba844", borderRadius: 6, cursor: "pointer", fontSize: 12 },

  // Form
  formCard: { backgroundColor: "#F5F3FF", borderRadius: 12, padding: 24, marginBottom: 20 },
  formTitle: { color: "#1F1344", fontSize: 16, fontWeight: 600, margin: "0 0 16px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column" },
  label: { color: "#1F1344", fontSize: 13, fontWeight: 500, marginBottom: 6 },
  input: { padding: "10px 12px", backgroundColor: "#ffffff", border: "1px solid #D8D3F5", borderRadius: 8, color: "#1F1344", fontSize: 14, outline: "none" },

  // Tasks
  empty: { textAlign: "center", padding: "60px 24px", backgroundColor: "#F5F3FF", borderRadius: 12 },
  taskList: { display: "flex", flexDirection: "column", gap: 12 },
  taskCard: { backgroundColor: "#ffffff", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, border: "1px solid #EDE9FE" },
  taskLeft: { display: "flex", gap: 12, flex: 1 },
  taskRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  taskTitle: { color: "#1F1344", fontSize: 15, fontWeight: 600, marginBottom: 4 },
  taskDesc: { color: "#6B7280", fontSize: 13, marginBottom: 6, lineHeight: 1.4 },
  taskMeta: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  statusSelect: { padding: "6px 12px", border: "1px solid", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", outline: "none" },

  // Members
  memberRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #EDE9FE" },
  memberAvatar: { width: 38, height: 38, borderRadius: "50%", backgroundColor: "#EDE9FE", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 },
};