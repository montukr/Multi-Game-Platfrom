import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./api/axios";

export default function App() {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/api/profile/me").then(res => setUser(res.data)).catch(() => setUser(null));
  }, []);

  async function logout() {
    try { await api.post("/api/auth/logout"); }
    finally { nav("/login"); }
  }

  return (
    <div>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: "1px solid #e5e7eb", position: "sticky",
        top: 0, background: "#fff", zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/" style={{ textDecoration: "none", color: "#111827", fontWeight: 800 }}>Multi‑Game</Link>
          <Link to="/snake" style={{ textDecoration: "none", color: "#374151" }}>Snake</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && <span style={{ color: "#111827", fontWeight: 600 }}>{user.username}</span>}
          {user && <span style={{ color: "#6b7280", fontSize: 12 }}>{user.email}</span>}
          <button onClick={logout} style={{
            padding: "6px 10px", borderRadius: 8, background: "#111827",
            color: "#fff", border: "none", cursor: "pointer"
          }}>Logout</button>
        </div>
      </header>
      <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
