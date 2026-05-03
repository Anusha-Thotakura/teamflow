// src/pages/ProjectsPage.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", budget: "" });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.post("/projects", {
        name: form.name,
        description: form.description,
        budget: parseFloat(form.budget) || 0,
      });
      setForm({ name: "", description: "", budget: "" });
      setShowForm(false);
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading projects...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>📁 Projects</h1>
        <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ New Project"}
        </button>
      </div>

      {/* Create Project Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New Project</h3>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Project Name *</label>
                <input
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={styles.input} placeholder="e.g. E-commerce Platform" required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Budget ($)</label>
                <input
                  type="number" value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  style={styles.input} placeholder="e.g. 50000"
                />
              </div>
              <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ ...styles.input, resize: "vertical", minHeight: "70px" }}
                  placeholder="Brief project description..."
                />
              </div>
            </div>
            <button type="submit" style={styles.submitBtn} disabled={creating}>
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No projects yet.</p>
          <p style={styles.emptySubtext}>Create your first project to get started!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map(project => (
            <div
              key={project.id}
              style={styles.card}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{project.name}</h3>
                <span style={styles.ownerBadge}>
                  {project.ownerEmail === localStorage.getItem("userEmail") ? "Owner" : "Member"}
                </span>
              </div>
              {project.description && (
                <p style={styles.cardDesc}>{project.description}</p>
              )}
              <div style={styles.cardFooter}>
                <span style={styles.budgetTag}>
                  💰 ${project.budget?.toLocaleString() || "N/A"}
                </span>
                <span style={styles.memberTag}>
                  👥 {project.memberEmails?.length || 0} members
                </span>
              </div>
              <div style={styles.viewMore}>View Details →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px", backgroundColor: "#ffffff", minHeight: "100vh" },
  loading: { color: "#cdd6f4", textAlign: "center", padding: "60px", fontSize: "18px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  title: { color: "#cdd6f4", fontSize: "26px", margin: 0 },
  createBtn: {
    backgroundColor: "#7c6af7", color: "#fff", border: "none",
    borderRadius: "8px", padding: "10px 20px", cursor: "pointer",
    fontSize: "14px", fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#313244", borderRadius: "12px", padding: "24px", marginBottom: "28px",
  },
  formTitle: { color: "#cdd6f4", margin: "0 0 16px", fontSize: "18px" },
  error: { backgroundColor: "#45475a", color: "#f38ba8", padding: "10px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column" },
  label: { color: "#cdd6f4", marginBottom: "6px", fontSize: "13px", fontWeight: "500" },
  input: {
    padding: "10px 12px", backgroundColor: "#45475a", border: "1px solid #585b70",
    borderRadius: "8px", color: "#cdd6f4", fontSize: "14px", outline: "none",
  },
  submitBtn: {
    marginTop: "16px", backgroundColor: "#7C3AED", color: "#ffffff",
    border: "none", borderRadius: "8px", padding: "10px 24px",
    cursor: "pointer", fontWeight: "700", fontSize: "14px",
  },
  emptyState: { textAlign: "center", padding: "80px 24px" },
  emptyText: { color: "#cdd6f4", fontSize: "20px", margin: "0 0 8px" },
  emptySubtext: { color: "#6c7086", fontSize: "15px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  card: {
    backgroundColor: "#313244", borderRadius: "12px", padding: "20px",
    cursor: "pointer", transition: "box-shadow 0.2s",
    border: "1px solid #45475a",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" },
  cardTitle: { color: "#cdd6f4", fontSize: "17px", margin: 0, fontWeight: "600" },
  ownerBadge: {
    backgroundColor: "#7c6af722", color: "#cba6f7",
    padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600",
  },
  cardDesc: { color: "#a6adc8", fontSize: "13px", marginBottom: "12px", lineHeight: "1.5" },
  cardFooter: { display: "flex", gap: "12px", marginBottom: "12px" },
  budgetTag: { color: "#a6e3a1", fontSize: "13px" },
  memberTag: { color: "#89b4fa", fontSize: "13px" },
  viewMore: { color: "#7c6af7", fontSize: "13px", fontWeight: "500" },
};