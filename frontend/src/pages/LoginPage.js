// src/pages/LoginPage.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;
      const decoded = jwtDecode(token);

      // Normalize role to always have ROLE_ prefix
      const role = decoded.role?.startsWith("ROLE_")
        ? decoded.role
        : `ROLE_${decoded.role}`;

      login(token, decoded.sub, role);

      if (role === "ROLE_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      // ✅ FIX: backend sends { error: "..." } not { message: "..." }
      setError(err.response?.data?.error || err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>⚡ TeamFlow</h1>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>Sign up</Link>
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
  error: { backgroundColor: "#45475a", color: "#f38ba8", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", borderLeft: "4px solid #f38ba8" },
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
};