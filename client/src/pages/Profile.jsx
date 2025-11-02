// import { useEffect, useState } from "react";
// import { api } from "../api/axios";

// export default function Profile() {
//   const [me, setMe] = useState(null);
//   const [progress, setProgress] = useState(null);
//   const [showUserForm, setShowUserForm] = useState(false);
//   const [showPassForm, setShowPassForm] = useState(false);
//   const [username, setUsername] = useState("");
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [msgUser, setMsgUser] = useState("");
//   const [msgPass, setMsgPass] = useState("");

//   useEffect(() => {
//     let on = true;
//     (async () => {
//       const meRes = await api.get("/api/profile/me");
//       const prRes = await api.get("/api/profile/progress");
//       if (!on) return;
//       setMe(meRes.data);
//       setProgress(prRes.data);
//     })();
//     return () => { on = false; };
//   }, []);

//   async function submitUsername(e) {
//     e.preventDefault();
//     setMsgUser("");
//     try {
//       const res = await api.post("/api/auth/change-username", { username });
//       setMe(m => ({ ...m, username: res.data.username }));
//       setMsgUser("Username updated");
//       setShowUserForm(false);
//       setUsername("");
//     } catch (e2) { setMsgUser(e2.response?.data?.message || "Failed"); }
//   }
//   async function submitPassword(e) {
//     e.preventDefault();
//     setMsgPass("");
//     try {
//       await api.post("/api/auth/change-password", { oldPassword, newPassword });
//       setMsgPass("Password updated");
//       setShowPassForm(false);
//       setOldPassword(""); setNewPassword("");
//     } catch (e2) { setMsgPass(e2.response?.data?.message || "Failed"); }
//   }

//   const tttWins     = progress?.totals?.ttt?.wins ?? 0;
//   const tttJoined   = progress?.totals?.ttt?.gamesJoined ?? 0;
//   const chessWins   = progress?.totals?.chess?.wins ?? 0;
//   const chessJoined = progress?.totals?.chess?.gamesJoined ?? 0;
//   const snakeHigh   = progress?.totals?.snake?.highestScore ?? 0;

//   return (
//     <div style={styles.shell}>
//       <div style={styles.card}>
//         <header style={styles.header}>
//           <div style={styles.avatar}>{me?.username?.slice(0,1).toUpperCase()}</div>
//           <div>
//             <h2 style={styles.title}>{me?.username || "Profile"}</h2>
//             <p style={styles.subtle}>{me?.email}</p>
//           </div>
//         </header>

//         <section style={styles.grid}>
//           <Stat title="Tic‑Tac‑Toe Wins" value={tttWins} />
//           <Stat title="Tic‑Tac‑Toe Joined" value={tttJoined} />
//           <Stat title="Chess Wins" value={chessWins} />
//           <Stat title="Chess Joined" value={chessJoined} />
//           <Stat title="Snake Highest Score" value={snakeHigh} />
//           <Stat title="Total Games Joined" value={me?.gamesJoined || 0} />
//         </section>

//         <section style={{ display: "grid", gap: 12 }}>
//           <ActionRow
//             label="Change Username"
//             hint="Update your display name"
//             onClick={() => { setShowUserForm(v => !v); setShowPassForm(false); setMsgUser(""); }}
//             open={showUserForm}
//           >
//             <form onSubmit={submitUsername} style={styles.formRow}>
//               <input placeholder="New username" value={username} onChange={(e)=>setUsername(e.target.value)} style={styles.input} />
//               <button type="submit" style={styles.primaryBtn}>Save</button>
//               <button type="button" style={styles.ghostBtn} onClick={() => setShowUserForm(false)}>Cancel</button>
//             </form>
//             {msgUser && <p style={styles.note}>{msgUser}</p>}
//           </ActionRow>

//           <ActionRow
//             label="Change Password"
//             hint="Set a new password"
//             onClick={() => { setShowPassForm(v => !v); setShowUserForm(false); setMsgPass(""); }}
//             open={showPassForm}
//           >
//             <form onSubmit={submitPassword} style={styles.formRow}>
//               <input placeholder="Current password" type="password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} style={styles.input} />
//               <input placeholder="New password (min 4)" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} style={styles.input} />
//               <button type="submit" style={styles.primaryBtn}>Update</button>
//               <button type="button" style={styles.ghostBtn} onClick={() => setShowPassForm(false)}>Cancel</button>
//             </form>
//             {msgPass && <p style={styles.note}>{msgPass}</p>}
//           </ActionRow>
//         </section>
//       </div>
//     </div>
//   );
// }

// function Stat({ title, value }) {
//   return (
//     <div style={styles.statCard}>
//       <div style={styles.statTitle}>{title}</div>
//       <div style={styles.statValue}>{value}</div>
//     </div>
//   );
// }
// function ActionRow({ label, hint, onClick, open, children }) {
//   return (
//     <div style={styles.actionCard}>
//       <div style={styles.actionHeader}>
//         <div>
//           <div style={styles.actionTitle}>{label}</div>
//           <div style={styles.subtle}>{hint}</div>
//         </div>
//         <button onClick={onClick} style={styles.primaryBtn}>{open ? "Close" : "Edit"}</button>
//       </div>
//       <div style={{ ...styles.revealWrap, maxHeight: open ? 200 : 0, opacity: open ? 1 : 0 }}>
//         {open && children}
//       </div>
//     </div>
//   );
// }

// const styles = {
//   shell: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" },
//   card: { width: "100%", maxWidth: 880, background: "#ffffff", borderRadius: 18, boxShadow: "0 12px 40px rgba(2,6,23,0.08)", padding: 20, display: "grid", gap: 16 },
//   header: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: "1px solid #e5e7eb" },
//   avatar: { width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
//   title: { margin: 0 },
//   subtle: { color: "#64748b", margin: 0, fontSize: 13 },
//   grid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" },
//   statCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.04)" },
//   statTitle: { color: "#64748b", fontSize: 13, marginBottom: 6 },
//   statValue: { fontWeight: 900, fontSize: 22, color: "#0f172a" },
//   actionCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.04)", overflow: "hidden" },
//   actionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
//   actionTitle: { fontWeight: 800 },
//   revealWrap: { transition: "max-height .25s ease, opacity .2s ease" },
//   formRow: { display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 12 },
//   input: { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", background: "#f8fafc" },
//   primaryBtn: { padding: "10px 12px", borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
//   ghostBtn: { padding: "10px 12px", borderRadius: 10, background: "#ffffff", color: "#0f172a", border: "1px solid #e5e7eb", cursor: "pointer", fontWeight: 700 },
//   note: { color: "#64748b", marginTop: 6 },
// };

import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msgUser, setMsgUser] = useState("");
  const [msgPass, setMsgPass] = useState("");

  useEffect(() => {
    let on = true;
    (async () => {
      const meRes = await api.get("/api/profile/me");
      const prRes = await api.get("/api/profile/progress");
      if (!on) return;
      setMe(meRes.data);
      setProgress(prRes.data);
    })();
    return () => { on = false; };
  }, []);

  async function submitUsername(e) {
    e.preventDefault();
    setMsgUser("");
    try {
      const res = await api.post("/api/auth/change-username", { username });
      setMe(m => ({ ...m, username: res.data.username }));
      setMsgUser("Username updated");
      setShowUserForm(false);
      setUsername("");
    } catch (e2) {
      setMsgUser(e2.response?.data?.message || "Failed");
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    setMsgPass("");
    try {
      await api.post("/api/auth/change-password", { oldPassword, newPassword });
      setMsgPass("Password updated");
      setShowPassForm(false);
      setOldPassword("");
      setNewPassword("");
    } catch (e2) {
      setMsgPass(e2.response?.data?.message || "Failed");
    }
  }

  const tttWins     = progress?.totals?.ttt?.wins ?? 0;
  const tttJoined   = progress?.totals?.ttt?.gamesJoined ?? 0;
  const chessWins   = progress?.totals?.chess?.wins ?? 0;
  const chessJoined = progress?.totals?.chess?.gamesJoined ?? 0;
  const snakeHigh   = progress?.totals?.snake?.highestScore ?? 0;
  const tetrisHigh  = progress?.totals?.tetris?.highestScore ?? 0;
  const flappyHigh  = progress?.totals?.flappy?.highestScore ?? 0;
  const pacmanHigh  = progress?.totals?.pacman?.highestScore ?? 0;

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div style={styles.avatar}>{me?.username?.slice(0,1).toUpperCase()}</div>
          <div>
            <h2 style={styles.title}>{me?.username || "Profile"}</h2>
            <p style={styles.subtle}>{me?.email}</p>
          </div>
        </header>

        <section style={styles.grid}>
          <Stat title="Tic‑Tac‑Toe Wins" value={tttWins} />
          <Stat title="Tic‑Tac‑Toe Joined" value={tttJoined} />
          <Stat title="Chess Wins" value={chessWins} />
          <Stat title="Chess Joined" value={chessJoined} />
          <Stat title="Snake Highest Score" value={snakeHigh} />
          <Stat title="Tetris Highest Score" value={tetrisHigh} />
          <Stat title="Flappy Bird Highest" value={flappyHigh} />
          <Stat title="Pac‑Man Highest" value={pacmanHigh} />
         
        </section>

        <section style={{ display: "grid", gap: 12 }}>
          <ActionRow
            label="Change Username"
            hint="Update your display name"
            onClick={() => { setShowUserForm(v => !v); setShowPassForm(false); setMsgUser(""); }}
            open={showUserForm}
          >
            <form onSubmit={submitUsername} style={styles.formRow}>
              <input
                placeholder="New username"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.primaryBtn}>Save</button>
              <button type="button" style={styles.ghostBtn} onClick={() => setShowUserForm(false)}>Cancel</button>
            </form>
            {msgUser && <p style={styles.note}>{msgUser}</p>}
          </ActionRow>

          <ActionRow
            label="Change Password"
            hint="Set a new password"
            onClick={() => { setShowPassForm(v => !v); setShowUserForm(false); setMsgPass(""); }}
            open={showPassForm}
          >
            <form onSubmit={submitPassword} style={styles.formRow}>
              <input
                placeholder="Current password"
                type="password"
                value={oldPassword}
                onChange={(e)=>setOldPassword(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="New password (min 4)"
                type="password"
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.primaryBtn}>Update</button>
              <button type="button" style={styles.ghostBtn} onClick={() => setShowPassForm(false)}>Cancel</button>
            </form>
            {msgPass && <p style={styles.note}>{msgPass}</p>}
          </ActionRow>
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

function ActionRow({ label, hint, onClick, open, children }) {
  return (
    <div style={styles.actionCard}>
      <div style={styles.actionHeader}>
        <div>
          <div style={styles.actionTitle}>{label}</div>
          <div style={styles.subtle}>{hint}</div>
        </div>
        <button onClick={onClick} style={styles.primaryBtn}>
          {open ? "Close" : "Edit"}
        </button>
      </div>
      <div style={{ ...styles.revealWrap, maxHeight: open ? 200 : 0, opacity: open ? 1 : 0 }}>
        {open && children}
      </div>
    </div>
  );
}

const styles = {
  shell: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" },
  card: { width: "100%", maxWidth: 880, background: "#ffffff", borderRadius: 18, boxShadow: "0 12px 40px rgba(2,6,23,0.08)", padding: 20, display: "grid", gap: 16 },
  header: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: "1px solid #e5e7eb" },
  avatar: { width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
  title: { margin: 0 },
  subtle: { color: "#64748b", margin: 0, fontSize: 13 },
  grid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" },
  statCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.04)" },
  statTitle: { color: "#64748b", fontSize: 13, marginBottom: 6 },
  statValue: { fontWeight: 900, fontSize: 22, color: "#0f172a" },
  actionCard: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.04)", overflow: "hidden" },
  actionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  actionTitle: { fontWeight: 800 },
  revealWrap: { transition: "max-height .25s ease, opacity .2s ease" },
  formRow: { display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 12 },
  input: { padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", background: "#f8fafc" },
  primaryBtn: { padding: "10px 12px", borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
  ghostBtn: { padding: "10px 12px", borderRadius: 10, background: "#ffffff", color: "#0f172a", border: "1px solid #e5e7eb", cursor: "pointer", fontWeight: 700 },
  note: { color: "#64748b", marginTop: 6 },
};
