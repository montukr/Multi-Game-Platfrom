import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/axios";
import { useParams } from "react-router-dom";

const initialBoard = () => {
  const b = Array(8).fill(null).map(()=>Array(8).fill(""));
  const back = ["r","n","b","q","k","b","n","r"];
  b[0] = back.slice(); b[1] = Array(8).fill("p");
  b[6] = Array(8).fill("P"); b[7] = back.map(c=>c.toUpperCase());
  return b;
};

export default function Chess() {
  const { roomId } = useParams();
  const [me, setMe] = useState(null);
  const [players, setPlayers] = useState([]);
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState("w");
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
      s.emit("joinRoom", { roomId, username: res.data.username });
      s.on("roomUpdate", (r) => setPlayers(r.players || []));
      s.on("gameState", ({ matrix, turn }) => { setBoard(matrix); setTurn(turn); setStatus(`Turn: ${turn === "w" ? "White" : "Black"}`); });
      s.on("errorMsg", (m) => setStatus(m));
    })();
    return () => { on = false; socketRef.current?.disconnect(); };
  }, [roomId]);

  const myColor = players.find(p => p.username === me?.username)?.color;
  const myTurn = myColor === turn;

  function click(r, c) {
    const piece = board[r][c];
    if (!sel) {
      if (!piece) return;
      const isWhite = piece === piece.toUpperCase();
      if ((isWhite && myColor !== "w") || (!isWhite && myColor !== "b")) return;
      setSel({ r, c });
      return;
    }
    socketRef.current.emit("move", { roomId, from: sel, to: { r, c } });
    setSel(null);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Chess</h2>
      <p>{status} • You: {me?.username} {myColor ? `(${myColor === "w" ? "White" : "Black"})` : ""} {myTurn ? "• Your move" : ""}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 64px)", gap: 0, border: "2px solid #111827", borderRadius: 8, overflow: "hidden" }}>
        {board.map((row, r) => row.map((cell, c) => {
          const dark = (r + c) % 2 === 1;
          const selCell = sel && sel.r === r && sel.c === c;
          return (
            <div key={`${r}-${c}`} onClick={() => myTurn && click(r,c)} style={{
              width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center",
              background: selCell ? "#fbbf24" : dark ? "#475569" : "#e2e8f0", color: cell === cell.toUpperCase() ? "#000" : "#111"
            }}>
              <span style={{ fontSize: 24 }}>{cell}</span>
            </div>
          );
        }))}
      </div>
      <div style={{ marginTop: 10 }}><button onClick={() => socketRef.current.emit("restart", { roomId })}>Restart</button></div>
    </div>
  );
}
