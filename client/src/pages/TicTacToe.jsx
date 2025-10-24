import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/axios";
import { useParams } from "react-router-dom";

export default function TicTacToe() {
  const { roomId } = useParams();
  const [me, setMe] = useState(null);
  const [players, setPlayers] = useState([]);
  const [state, setState] = useState({ board: Array(9).fill(null), turn: "X", winner: null, moves: 0 });
  const [status, setStatus] = useState("Connecting...");
  const socketRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await api.get("/api/profile/me");
      if (!alive) return;
      setMe(res.data);
      const s = io(import.meta.env.VITE_SOCKET_URL + "/tictactoe", { withCredentials: true });
      socketRef.current = s;
      s.emit("joinRoom", { roomId, userId: res.data.id, username: res.data.username });
      s.on("roomUpdate", (r) => { setPlayers(r.players || []); setStatus(r.started ? "Game on" : "Waiting opponent"); });
      s.on("gameState", (gs) => setState(gs));
      s.on("gameOver", ({ winner }) => setStatus(winner === "draw" ? "Draw" : `Winner: ${winner}`));
      s.on("errorMsg", (m) => setStatus(m));
    })();
    return () => { alive = false; socketRef.current?.disconnect(); };
  }, [roomId]);

  const mySymbol = players.find(p => p.username === me?.username)?.symbol;
  const canPlay = (i) => mySymbol && state.turn === mySymbol && !state.winner && !state.board[i];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 6 }}>Tic‑Tac‑Toe</h2>
      <p style={{ margin: "4px 0" }}>
        You: {me?.username} {mySymbol ? `(${mySymbol})` : ""} • Turn: {state.winner ? "-" : state.turn} • {status}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 110px)", gap: 10, marginTop: 10 }}>
        {state.board.map((v, i) => (
          <button
            key={i}
            onClick={() => canPlay(i) && socketRef.current.emit("playerMove", { roomId, index: i })}
            style={{
              width: 110, height: 110, borderRadius: 14, border: "2px solid #e5e7eb",
              background: v ? "#06b6d4" : canPlay(i) ? "#f8fafc" : "#ffffff",
              color: "#0f172a", fontSize: 36, fontWeight: 800, cursor: canPlay(i) ? "pointer" : "not-allowed",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}
          >
            {v || ""}
          </button>
        ))}
      </div>
      <button onClick={() => socketRef.current.emit("restart", { roomId })} style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
        Restart
      </button>
    </div>
  );
}
