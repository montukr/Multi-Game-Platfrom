import { useState } from "react";
import { api } from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/api/auth/register", { email, username, password });
      await api.post("/api/auth/login", { identifier: username, password });
      nav("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 360, margin: "40px auto" }}>
      <h2 style={{ marginBottom: 12 }}>Register</h2>
      {msg && <p style={{ color: "red" }}>{msg}</p>}
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input placeholder="Password (min 4)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit" style={{ padding: 10, borderRadius: 8, background: "#0ea5e9", color: "#fff", border: "none" }}>Create account</button>
      </form>
      <p style={{ marginTop: 8 }}>Have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
