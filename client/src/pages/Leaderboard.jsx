import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function Leaderboard() {
  const [data, setData] = useState({ ttt:[], chess:[], snake:[], tetris:[], flappy:[], pacman:[] });
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState("");

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      try {
        const r = await api.get(`/api/leaderboard?limit=${limit}`);
        if (!on) return;
        setData(r.data || { ttt:[], chess:[], snake:[], tetris:[], flappy:[], pacman:[] });
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [limit]);

  const cols = [
    { key: "ttt", label: "Tic‑Tac‑Toe", metric: "wins" },
    { key: "chess", label: "Chess", metric: "wins" },
    { key: "snake", label: "Snake", metric: "highest" },
    { key: "tetris", label: "Tetris", metric: "highest" },
    { key: "flappy", label: "Flappy Bird", metric: "highest" },
    { key: "pacman", label: "Pac‑Man", metric: "highest" },
  ];

  function filterRows(rows) {
    if (!q.trim()) return rows;
    const s = q.trim().toLowerCase();
    return rows.filter(r => (r.username || "").toLowerCase().includes(s));
  }

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>Leaderboards</h2>
            <p style={{ margin: 0, color: "#64748b" }}>Top players across all games</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <input
              placeholder="Search username"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              style={styles.input}
            />
            <span style={{ color:"#64748b" }}>Top</span>
            <select value={limit} onChange={e => setLimit(parseInt(e.target.value,10))} style={styles.select}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>Loading…</div>
        ) : (
          <div style={styles.grid}>
            {cols.map(col => (
              <div key={col.key} style={styles.board}>
                <div style={styles.boardHead}>{col.label}</div>
                <div style={{ display:"grid" }}>
                  {filterRows(data[col.key] || []).length === 0 ? (
                    <div style={styles.empty}>No entries</div>
                  ) : (
                    filterRows(data[col.key] || []).map((row, i) => (
                      <div key={row.userId + "-" + i} style={styles.row}>
                        <span style={styles.left}>{i+1}. {row.username}</span>
                        <span style={styles.right}>
                          {col.metric === "wins" ? `${row.wins} wins` : row.highest}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 1100,
    background: "#ffffff",
    borderRadius: 18,
    boxShadow: "0 12px 40px rgba(2,6,23,0.08)",
    padding: 16,
    display: "grid",
    gap: 12,
  },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  grid: { display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))" },
  board: { border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", background:"#fff" },
  boardHead: { padding:"10px 12px", fontWeight:800, background:"#f8fafc", borderBottom:"1px solid #e5e7eb" },
  empty: { padding:12, color:"#94a3b8" },
  row: { padding:"8px 12px", display:"flex", justifyContent:"space-between", borderTop:"1px solid #f1f5f9" },
  left: { fontWeight:700, color:"#0f172a" },
  right: { fontWeight:700, color:"#475569" },
  input: { padding:"8px 10px", borderRadius:10, border:"1px solid #e5e7eb", background:"#f8fafc" },
  select: { padding:"6px 10px", borderRadius:10, border:"1px solid #e5e7eb", background:"#f8fafc" },
};
