import { useState } from "react";
import { api } from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/api/auth/login", { identifier, password });
      nav("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 360, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 12 }}>Login</h2>
      {msg && <p style={{ color: "red" }}>{msg}</p>}
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Username or Email" value={identifier} onChange={e=>setIdentifier(e.target.value)} />
        <input placeholder="Password (min 4)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit" style={{ padding: 10, borderRadius: 8, background: "#111827", color: "#fff", border: "none" }}>Login</button>
      </form>
      <p style={{ marginTop: 8 }}>New? <Link to="/register">Create account</Link></p>
    </div>
  );
}
