// src/components/Navbar.js
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { userEmail, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/" style={styles.logo}>⚡ TeamFlow</Link>
      </div>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>

        {/* ✅ FIXED */}
        {role === "ROLE_ADMIN" && (
          <Link to="/admin" style={styles.link}>Admin Panel</Link>
        )}
      </div>

      <div style={styles.right}>
        <span style={styles.email}>{userEmail}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 32px", backgroundColor: "#ffffff", color: "#1F1344",
    boxShadow: "0 2px 8px rgba(109,40,217,0.08)", borderBottom: "1px solid #EDE9FE", position: "sticky", top: 0, zIndex: 100,
  },
  brand: { display: "flex", alignItems: "center" },
  logo: {
    color: "#7c6af7", fontWeight: "bold", fontSize: "20px",
    textDecoration: "none", letterSpacing: "0.5px",
  },
  links: { display: "flex", gap: "24px" },
  link: { color: "#4B3FA0", textDecoration: "none", fontSize: "15px", fontWeight: "500" },
  right: { display: "flex", alignItems: "center", gap: "16px" },
  email: { color: "#7C6FA0", fontSize: "13px" },
  logoutBtn: {
    backgroundColor: "#7C3AED", color: "#ffffff", border: "none",
    padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600",
  },
};