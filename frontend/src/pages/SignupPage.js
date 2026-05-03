// src/pages/SignupPage.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      // ✅ FIX: backend sends { error: "..." } not { message: "..." }
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed. You may not be invited.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>⚡ TeamFlow</h1>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.subtitle}>Join your team on TeamFlow</p>

        {error && <div style={styles.error}>❌ {error}</div>}
        {success && <div style={styles.successMsg}>✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { name: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
            { name: "email", label: "Email", type: "email", placeholder: "you@company.com" },
            { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          ))}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>

        <p style={styles.note}>
          🔒 Sign-up is by invitation only. Contact your admin if you can't register.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" },
  card: { backgroundColor: "#313244", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" },
  logo: { color: "#7c6af7", textAlign: "center", marginBottom: "4px", fontSize: "28px" },
  title: { color: "#cdd6f4", textAlign: "center", margin: "0 0 4px", fontSize: "22px" },
  subtitle: { color: "#a6adc8", textAlign: "center", marginBottom: "28px", fontSize: "14px" },
  error: { backgroundColor: "#f38ba822", color: "#f38ba8", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", borderLeft: "4px solid #f38ba8" },
  successMsg: { backgroundColor: "#a6e3a122", color: "#a6e3a1", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", borderLeft: "4px solid #a6e3a1" },
  field: { marginBottom: "16px" },
  label: { display: "block", color: "#cdd6f4", marginBottom: "6px", fontSize: "14px", fontWeight: "500" },
  input: {
    width: "100%", padding: "10px 14px", backgroundColor: "#45475a",
    border: "1px solid #585b70", borderRadius: "8px", color: "#cdd6f4",
    fontSize: "15px", outline: "none", boxSizing: "border-box",
  },
  btn: { width: "100%", padding: "12px", backgroundColor: "#7c6af7", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer", marginTop: "8px" },
  footer: { color: "#a6adc8", textAlign: "center", marginTop: "20px", fontSize: "14px" },
  link: { color: "#7c6af7", textDecoration: "none", fontWeight: "600" },
  note: { color: "#6c7086", textAlign: "center", marginTop: "12px", fontSize: "12px" },
};