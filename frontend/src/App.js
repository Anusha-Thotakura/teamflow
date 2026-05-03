// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/DashboardPage";
import SignupPage from "./pages/SignupPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import Navbar from "./components/Navbar";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function PrivateRoute({ children, roles }) {
  const { token } = useAuth();
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <>
      {token && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ✅ FIXED: ROLE_USER (not ROLE_MEMBER) matches what backend issues */}
        <Route path="/" element={
          <PrivateRoute roles={["ROLE_USER", "ROLE_ADMIN"]}>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/projects" element={
          <PrivateRoute roles={["ROLE_USER", "ROLE_ADMIN"]}>
            <ProjectsPage />
          </PrivateRoute>
        } />

        <Route path="/projects/:id" element={
          <PrivateRoute roles={["ROLE_USER", "ROLE_ADMIN"]}>
            <ProjectDetailPage />
          </PrivateRoute>
        } />

        {/* ADMIN ONLY */}
        <Route path="/admin" element={
          <PrivateRoute roles={["ROLE_ADMIN"]}>
            <AdminDashboardPage />
          </PrivateRoute>
        } />

      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}