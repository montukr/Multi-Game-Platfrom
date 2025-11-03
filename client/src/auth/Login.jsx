// import { useState } from "react";
// import { api } from "../api/axios";
// import { Link, useNavigate } from "react-router-dom";

// export default function Login() {
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");
//   const nav = useNavigate();

//   async function submit(e) {
//     e.preventDefault();
//     setMsg("");
//     try {
//       await api.post("/api/auth/login", { identifier, password });
//       nav("/");
//     } catch (err) {
//       setMsg(err.response?.data?.message || "Login failed");
//     }
//   }

//   return (
//     <div style={{ padding: 16, maxWidth: 360, margin: "40px auto" }}>
//       <h2 style={{ marginBottom: 12 }}>Login</h2>
//       {msg && <p style={{ color: "red" }}>{msg}</p>}
//       <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
//         <input placeholder="Username or Email" value={identifier} onChange={e=>setIdentifier(e.target.value)} />
//         <input placeholder="Password (min 4)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
//         <button type="submit" style={{ padding: 10, borderRadius: 8, background: "#111827", color: "#fff", border: "none" }}>Login</button>
//       </form>
//       <p style={{ marginTop: 8 }}>New? <Link to="/register">Create account</Link></p>
//     </div>
//   );
// }

import { useState } from "react";
import { api } from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

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
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.banner}>
          <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
        </div>
        <h2 style={{ marginTop: 12, marginBottom: 0 }}>Login</h2>
        <p style={{ marginTop: 4, color: "#64748b" }}>Use username or email</p>
        {msg && <p style={{ color: "#ef4444", marginTop: 6 }}>{msg}</p>}
        <form onSubmit={submit} style={styles.form}>
          <input
            placeholder="Username or Email"
            value={identifier}
            onChange={e=>setIdentifier(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Password (min 4)"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.primary}>Login</button>
        </form>
        <p style={{ marginTop: 12 }}>
          New? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  shell: { minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  card: { width:"100%", maxWidth:420, padding:16, borderRadius:16, background:"#fff", boxShadow:"0 12px 40px rgba(2,6,23,0.08)" },
  banner: { width: "100%", height: 120, borderRadius: 12, overflow: "hidden", background:"#f1f5f9" },
  form: { display:"grid", gap:10, marginTop:10 },
  input: { padding:12, border:"1px solid #e5e7eb", borderRadius:10, background:"#f8fafc" },
  primary: { padding:"10px 12px", borderRadius:10, background:"linear-gradient(135deg, #0ea5e9, #2563eb)", color:"#fff", border:"none", cursor:"pointer", fontWeight:700 },
};
