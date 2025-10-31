import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/axios";
import { useParams } from "react-router-dom";

const icon = (p) => ({
  P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
  p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
}[p] || "");

export default function Chess() {
  const { roomId } = useParams();
  const [me, setMe] = useState(null);
  const [players, setPlayers] = useState([]);
  const [board, setBoard] = useState(Array(8).fill(null).map(()=>Array(8).fill("")));
  const [turn, setTurn] = useState("w");
  const [winner, setWinner] = useState(null);
  const [sel, setSel] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const socketRef = useRef(null);

  useEffect(() => {
    let on = true;
    (async () => {
      const res = await api.get("/api/profile/me");
      if (!on) return;
      setMe(res.data);
      const s = io(import.meta.env.VITE_SOCKET_URL + "/chess", { withCredentials: true });
      socketRef.current = s;
      s.emit("joinRoom", { roomId, userId: res.data.id, username: res.data.username });

      s.on("roomUpdate", (r) => setPlayers(r.players || []));
      s.on("gameState", ({ matrix, turn, winner, started }) => {
        if (matrix) setBoard(matrix);
        if (turn) setTurn(turn);
        setWinner(winner || null);
        setStatus(winner ? "" : (!started ? "Waiting for opponent…" : (myTurnRef.current ? "Your Move" : "Opponent’s Move")));
        if (winner || !started) setSel(null);
      });
      s.on("gameOver", ({ winner }) => {
        setWinner(winner);
        setStatus("");
      });
      s.on("errorMsg", (m) => setStatus(m));
    })();
    return () => { on = false; socketRef.current?.disconnect(); };
  }, [roomId]);

  const myColor = useMemo(() => players.find(p => p.username === me?.username)?.color, [players, me]);
  const started = players.length === 2;
  const myTurn = !winner && started && myColor === turn;
  const myTurnRef = useRef(myTurn);
  useEffect(() => { myTurnRef.current = myTurn; }, [myTurn]);

  // View transform for black; clicks mapped back to actual coords
  const displayRows = useMemo(() => {
    const rows = [...board];
    return myColor === "b" ? [...rows].reverse().map(r => [...r].reverse()) : rows;
  }, [board, myColor]);

  function toActual(viewR, viewC) {
    return myColor === "b" ? { r: 7 - viewR, c: 7 - viewC } : { r: viewR, c: viewC };
  }

  function click(viewR, viewC) {
    if (winner || !started || !myTurn) return;
    const { r, c } = toActual(viewR, viewC);
    const piece = board[r][c];
    if (!sel) {
      if (!piece) return;
      const isWhite = piece === piece.toUpperCase();
      if ((isWhite && myColor !== "w") || (!isWhite && myColor !== "b")) return;
      setSel({ r, c, vr: viewR, vc: viewC });
      return;
    }
    socketRef.current.emit("move", { from: { r: sel.r, c: sel.c }, to: { r, c } });
    setSel(null);
  }

  const resultText = winner
    ? (winner === "draw" ? "Draw" : (winner === myColor ? "You Win!" : "You lose — try again"))
    : (!started ? "Waiting for opponent…" : (myTurn ? "Your Move" : "Opponent’s Move"));

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Chess</h2>
          <span style={{ ...styles.badge, background: winner ? "#f1f5f9" : "#e0f2fe", color: winner ? "#475569" : "#0369a1" }}>
            {resultText}
          </span>
        </div>

        <div style={styles.boardWrap}>
          <div style={{
            ...styles.board,
            transform: myColor === "b" ? "rotate(180deg)" : "none",
            transition: "transform .2s ease",
          }}>
            {displayRows.map((row, vr) =>
              row.map((cell, vc) => {
                const dark = (vr + vc) % 2 === 1;
                const isSelected = sel && sel.vr === vr && sel.vc === vc;
                const isWhitePiece = cell === cell.toUpperCase();
                return (
                  <button
                    key={`${vr}-${vc}`}
                    onClick={() => click(vr, vc)}
                    style={{
                      ...styles.square,
                      background: isSelected ? "#fde68a" : (dark ? "#769656" : "#eeeed2"),
                      color: isWhitePiece ? "#111827" : "#0f172a",
                      cursor: myTurn ? "pointer" : "default",
                    }}
                  >
                    <span style={{
                      fontSize: 34,
                      transition: "transform .12s ease, opacity .12s ease",
                      transform: cell ? "scale(1)" : "scale(0.8)",
                      opacity: cell ? 1 : 0,
                      display: "inline-block",
                      transformOrigin: "center",
                      ...(myColor === "b" ? { transform: (cell ? "scale(1)" : "scale(0.8)") + " rotate(180deg)" } : {}),
                    }}>
                      {icon(cell)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={() => socketRef.current.emit("restart")} style={styles.primaryBtn}>
            Restart (alternate start)
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  shell: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" },
  card: { width: "100%", maxWidth: 700, background: "#ffffff", borderRadius: 18, boxShadow: "0 12px 40px rgba(2,6,23,0.08)", padding: 16, display: "grid", gap: 12 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  badge: { padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 13 },
  boardWrap: { display: "flex", alignItems: "center", justifyContent: "center" },
  board: { display: "grid", gridTemplateColumns: "repeat(8, 64px)", gridTemplateRows: "repeat(8, 64px)", gap: 0, border: "6px solid #262626", borderRadius: 12, overflow: "hidden" },
  square: { width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .12s ease" },
  footer: { display: "flex", justifyContent: "center", marginTop: 6 },
  primaryBtn: { padding: "10px 12px", borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
};
