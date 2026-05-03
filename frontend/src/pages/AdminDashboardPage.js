// src/pages/AdminDashboardPage.js
import { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState({ text: "", type: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [projRes, userRes, inviteRes] = await Promise.all([
        api.get("/projects/all"),
        api.get("/users"),
        api.get("/auth/invite"),
      ]);
      setProjects(projRes.data);
      setUsers(userRes.data);
      setInvitedEmails(inviteRes.data.invitedEmails || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteMsg({ text: "", type: "" });
    try {
      const res = await api.post("/auth/invite", { email: inviteEmail.trim() });
      setInviteMsg({ text: res.data.message || "Invited successfully!", type: "success" });
      setInviteEmail("");
      await load();
    } catch (err) {
      setInviteMsg({
        text: err.response?.data?.error || "Failed to invite email.",
        type: "error"
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevoke = async (email) => {
    if (!window.confirm(`Remove ${email} from whitelist?`)) return;
    try {
      await api.delete(`/auth/invite/${encodeURIComponent(email)}`);
      setInviteMsg({ text: `${email} removed from whitelist.`, type: "success" });
      await load();
    } catch (err) {
      setInviteMsg({ text: "Failed to remove email.", type: "error" });
    }
  };

  if (loading) return <div style={styles.loading}>Loading admin panel...</div>;

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "invite", label: "✉️ Invite Members" },
    { key: "projects", label: "📁 All Projects" },
    { key: "users", label: "👥 All Users" },
  ];

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🛡️ Admin Panel</h1>
          <p style={styles.subtitle}>Manage your team and projects</p>
        </div>
      </div>

      {/* Global message */}
      {inviteMsg.text && (
        <div style={{
          ...styles.msg,
          backgroundColor: inviteMsg.type === "success" ? "#a6e3a122" : "#f38ba822",
          color: inviteMsg.type === "success" ? "#a6e3a1" : "#f38ba8",
          borderLeft: `4px solid ${inviteMsg.type === "success" ? "#a6e3a1" : "#f38ba8"}`,
        }}>
          {inviteMsg.type === "success" ? "✅ " : "❌ "}{inviteMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabBar}>
        {tabs.map(t => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div>
          <div style={styles.statsRow}>
            {[
              { icon: "👥", value: users.length, label: "Total Users", color: "#89b4fa" },
              { icon: "📁", value: projects.length, label: "Total Projects", color: "#cba6f7" },
              { icon: "✉️", value: invitedEmails.length, label: "Invited Emails", color: "#a6e3a1" },
              { icon: "🔒", value: invitedEmails.length - users.length > 0 ? invitedEmails.length - users.length : 0, label: "Pending Signups", color: "#fab387" },
            ].map(s => (
              <div key={s.label} style={styles.statCard}>
                <span style={styles.statIcon}>{s.icon}</span>
                <span style={{ ...styles.statValue, color: s.color }}>{s.value}</span>
                <span style={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <div style={styles.twoCol}>
            {/* Recent Users */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Recent Users</h3>
              {users.slice(0, 6).map(u => (
                <div key={u.id} style={styles.row}>
                  <div style={styles.avatar}>{u.email[0].toUpperCase()}</div>
                  <div>
                    <div style={styles.rowEmail}>{u.email}</div>
                    <div style={styles.rowRole}>{u.name || "—"}</div>
                  </div>
                  <span style={{
                    ...styles.roleBadge,
                    backgroundColor: u.role === "ADMIN" ? "#7c6af722" : "#89b4fa22",
                    color: u.role === "ADMIN" ? "#cba6f7" : "#89b4fa",
                  }}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Projects */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Recent Projects</h3>
              {projects.slice(0, 6).map(p => (
                <div key={p.id} style={styles.row}>
                  <div style={{ ...styles.avatar, backgroundColor: "#7c6af722", color: "#cba6f7" }}>📁</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.rowEmail}>{p.name}</div>
                    <div style={styles.rowRole}>Owner: {p.ownerEmail}</div>
                  </div>
                  <span style={styles.memberCount}>👥 {p.memberEmails?.length || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INVITE TAB */}
      {activeTab === "invite" && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Invite Team Members</h3>
          <p style={styles.hint}>
            Only invited emails can sign up. Add emails below, then share the signup link:
            <code style={styles.code}> http://localhost:3000/signup</code>
          </p>

          <form onSubmit={handleInvite} style={styles.inviteForm}>
            <input
              type="email"
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              style={styles.inviteInput}
              required
            />
            <button type="submit" style={styles.inviteBtn} disabled={inviteLoading}>
              {inviteLoading ? "Inviting..." : "✉️ Send Invite"}
            </button>
          </form>

          <h4 style={{ color: "#6B7280", marginTop: "28px", marginBottom: "12px" }}>
            Whitelist ({invitedEmails.length} emails)
          </h4>

          {invitedEmails.length === 0 ? (
            <p style={styles.empty}>No emails invited yet.</p>
          ) : (
            invitedEmails.map(email => {
              const isRegistered = users.some(u => u.email === email);
              return (
                <div key={email} style={styles.inviteRow}>
                  <div style={styles.inviteAvatar}>{email[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.rowEmail}>{email}</div>
                    <div style={styles.rowRole}>
                      {isRegistered
                        ? <span style={{ color: "#a6e3a1" }}>✅ Registered</span>
                        : <span style={{ color: "#fab387" }}>⏳ Pending signup</span>}
                    </div>
                  </div>
                  {email !== "admin@gmail.com" && (
                    <button
                      onClick={() => handleRevoke(email)}
                      style={styles.revokeBtn}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PROJECTS TAB */}
      {activeTab === "projects" && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>All Projects ({projects.length})</h3>
          {projects.length === 0 ? (
            <p style={styles.empty}>No projects created yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Project", "Owner", "Budget", "Members", "Status"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ color: "#1F1344", fontWeight: 600 }}>{p.name}</div>
                      {p.description && <div style={{ color: "#9CA3AF", fontSize: 12 }}>{p.description.slice(0, 60)}...</div>}
                    </td>
                    <td style={styles.td}><span style={styles.emailChip}>{p.ownerEmail}</span></td>
                    <td style={{ ...styles.td, color: "#a6e3a1" }}>${p.budget?.toLocaleString() || "N/A"}</td>
                    <td style={styles.td}>{p.memberEmails?.length || 0} members</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.roleBadge, backgroundColor: "#a6e3a122", color: "#a6e3a1" }}>
                        {p.status || "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>All Users ({users.length})</h3>
          {users.length === 0 ? (
            <p style={styles.empty}>No users registered yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {["User", "Email", "Role", "Status"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userRow}>
                        <div style={styles.avatar}>{u.email[0].toUpperCase()}</div>
                        <span style={{ color: "#1F1344" }}>{u.name || "—"}</span>
                      </div>
                    </td>
                    <td style={styles.td}><span style={styles.emailChip}>{u.email}</span></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        backgroundColor: u.role === "ADMIN" ? "#7c6af722" : "#89b4fa22",
                        color: u.role === "ADMIN" ? "#cba6f7" : "#89b4fa",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: "#a6e3a1", fontSize: 13 }}>✅ Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "sans-serif" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#1F1344", fontSize: 18, background: "#ffffff" },
  header: { marginBottom: "24px" },
  title: { color: "#1F1344", fontSize: "28px", margin: 0, fontWeight: 700 },
  subtitle: { color: "#9CA3AF", margin: "4px 0 0", fontSize: "14px" },
  msg: { padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  tabBar: { display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" },
  tab: {
    padding: "9px 18px", borderRadius: "8px", border: "1px solid #EDE9FE",
    backgroundColor: "transparent", color: "#7C6FA0", cursor: "pointer", fontSize: "14px", fontWeight: 500,
  },
  tabActive: { backgroundColor: "#7c6af7", color: "#fff", border: "1px solid #7c6af7" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" },
  statCard: {
    flex: "1 1 140px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #EDE9FE",
    padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
  },
  statIcon: { fontSize: "24px" },
  statValue: { fontSize: "32px", fontWeight: 700 },
  statLabel: { fontSize: "13px", color: "#9CA3AF" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  section: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "24px", marginBottom: "20px", border: "1px solid #EDE9FE" },
  sectionTitle: { color: "#1F1344", fontSize: "18px", fontWeight: 600, margin: "0 0 16px" },
  hint: { color: "#6B7280", fontSize: "14px", marginBottom: "16px", lineHeight: "1.6" },
  code: { backgroundColor: "#EDE9FE", color: "#6D28D9", padding: "2px 8px", borderRadius: "4px", fontSize: "13px" },
  row: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #EDE9FE" },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#89b4fa22",
    color: "#89b4fa", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "15px", flexShrink: 0,
  },
  inviteAvatar: {
    width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#a6e3a122",
    color: "#a6e3a1", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "15px", flexShrink: 0,
  },
  rowEmail: { color: "#1F1344", fontSize: "14px", fontWeight: 500 },
  rowRole: { color: "#9CA3AF", fontSize: "12px" },
  roleBadge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" },
  memberCount: { color: "#89b4fa", fontSize: "13px" },
  inviteForm: { display: "flex", gap: "12px", marginBottom: "8px" },
  inviteInput: {
    flex: 1, padding: "10px 14px", backgroundColor: "#F8F7FF", border: "1px solid #D8D3F5",
    border: "1px solid #D8D3F5", borderRadius: "8px", color: "#1F1344",
    fontSize: "14px", outline: "none",
  },
  inviteBtn: {
    padding: "10px 20px", backgroundColor: "#7c6af7", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px",
  },
  inviteRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #EDE9FE" },
  revokeBtn: {
    padding: "4px 12px", backgroundColor: "#f38ba822", color: "#f38ba8",
    border: "1px solid #f38ba844", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
  },
  empty: { color: "#9CA3AF", fontSize: "14px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { color: "#7C6FA0", fontSize: "12px", fontWeight: 600, textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #EDE9FE", textTransform: "uppercase", letterSpacing: "0.5px" },
  tr: { borderBottom: "1px solid #2a2a3d" },
  td: { padding: "12px 12px", color: "#374151", fontSize: "14px", verticalAlign: "middle" },
  userRow: { display: "flex", alignItems: "center", gap: "10px" },
  emailChip: { backgroundColor: "#EDE9FE", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", color: "#4C1D95" },
};