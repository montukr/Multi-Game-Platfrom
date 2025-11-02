// import { useEffect, useMemo, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import { api } from "../api/axios";
// import { useParams } from "react-router-dom";

// function useConfetti() {
//   const burst = () => {
//     const colors = ["#22c55e","#0ea5e9","#a78bfa","#f97316","#ef4444","#eab308"];
//     for (let i = 0; i < 30; i++) {
//       const el = document.createElement("div");
//       el.style.position = "fixed";
//       el.style.left = Math.random() * 100 + "vw";
//       el.style.top = "0px";
//       el.style.width = "8px";
//       el.style.height = "8px";
//       el.style.background = colors[Math.floor(Math.random()*colors.length)];
//       el.style.borderRadius = "50%";
//       el.style.opacity = "0.9";
//       el.style.zIndex = "9999";
//       el.style.transform = `translateY(0)`;
//       el.style.transition = `transform ${1 + Math.random()}s cubic-bezier(.2,.8,.2,1), opacity .3s ease ${0.9+Math.random()*0.3}s`;
//       document.body.appendChild(el);
//       requestAnimationFrame(() => {
//         el.style.transform = `translateY(${80 + Math.random()*90}vh)`;
//         setTimeout(() => {
//           el.style.opacity = "0";
//           setTimeout(() => el.remove(), 400);
//         }, 1200);
//       });
//     }
//   };
//   return { burst };
// }

// export default function TicTacToe() {
//   const { roomId } = useParams();
//   const [me, setMe] = useState(null);
//   const [players, setPlayers] = useState([]);
//   const [state, setState] = useState({ board: Array(9).fill(null), turn: "X", winner: null, moves: 0 });
//   const [scores, setScores] = useState({ X: 0, O: 0 });
//   const [showWinner, setShowWinner] = useState(null);
//   const [status, setStatus] = useState("Connecting...");
//   const socketRef = useRef(null);
//   const mySymbolRef = useRef(null);
//   const { burst } = useConfetti();

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       const res = await api.get("/api/profile/me");
//       if (!alive) return;
//       setMe(res.data);
//       const s = io(import.meta.env.VITE_SOCKET_URL + "/tictactoe", { withCredentials: true });
//       socketRef.current = s;
//       s.emit("joinRoom", { roomId, userId: res.data.id, username: res.data.username });

//       s.on("roomUpdate", (r) => {
//         setPlayers(r.players || []);
//         const started = (r.players || []).length === 2;
//         setStatus(started ? "" : "Waiting for opponent…");
//       });
//       s.on("gameState", (gs) => {
//         setState(gs);
//         if (!gs.winner) setShowWinner(null);
//       });
//       s.on("gameOver", ({ winner }) => {
//         setShowWinner(winner);
//         if (winner && winner !== "draw" && winner === mySymbolRef.current) {
//           setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
//           burst();
//         }
//       });
//       s.on("errorMsg", (m) => setStatus(m));
//     })();
//     return () => { alive = false; socketRef.current?.disconnect(); };
//   }, [roomId]);

//   const mySymbol = useMemo(() => players.find(p => p.username === me?.username)?.symbol, [players, me]);
//   useEffect(() => { mySymbolRef.current = mySymbol; }, [mySymbol]);

//   const started = players.length === 2;
//   const yourTurn = started && mySymbol && state.turn === mySymbol && !state.winner;
//   const opponentTurn = started && mySymbol && state.turn !== mySymbol && !state.winner;
//   const turnMsg = state.winner ? "" : (!started ? "Waiting for opponent…" : yourTurn ? "Your Turn" : "Opponent’s Turn");

//   const canPlay = (i) => started && mySymbol && state.turn === mySymbol && !state.winner && !state.board[i];
//   const clickCell = (i) => { if (canPlay(i)) socketRef.current.emit("playerMove", { index: i }); };
//   const playAgain = () => { setShowWinner(null); socketRef.current.emit("restart"); };

//   const isDraw = showWinner === "draw";
//   const iWon  = showWinner && showWinner !== "draw" && showWinner === mySymbol;
//   const msg   = isDraw ? "Draw Game" : iWon ? "You Win!" : "You lose — try again";
//   const color = isDraw ? "#64748b" : iWon ? "#22c55e" : "#ef4444";

//   return (
//     <div style={styles.shell}>
//       <div style={styles.card}>
//         <div style={styles.banner}>
//           <PlayerTag name={`${me?.username || "You"} ${mySymbol ? `(${mySymbol})` : ""}`} score={mySymbol ? scores[mySymbol] : 0} active={yourTurn} />
//           <div style={styles.bannerCenter}>
//             <span style={{
//               ...styles.status,
//               color: !started ? "#64748b" : yourTurn ? "#22c55e" : opponentTurn ? "#eab308" : "#64748b"
//             }}>
//               {turnMsg}
//             </span>
//           </div>
//           <PlayerTag name={players.find(p => p.username !== me?.username)?.username || "Opponent"} score={mySymbol ? scores[mySymbol === "X" ? "O" : "X"] : 0} active={opponentTurn} />
//         </div>

//         <div style={styles.boardWrap}>
//           <div style={styles.board}>
//             {state.board.map((v, i) => (
//               <button
//                 key={i}
//                 onClick={() => clickCell(i)}
//                 style={{
//                   ...styles.cell,
//                   cursor: canPlay(i) ? "pointer" : "not-allowed",
//                   background: v ? "#0ea5e908" : canPlay(i) ? "#f8fafc" : "#ffffff",
//                   borderColor: v ? "#38bdf8" : "#e5e7eb",
//                   transform: canPlay(i) ? "translateY(-1px)" : "none",
//                 }}
//               >
//                 <span style={{
//                   ...styles.mark,
//                   color: v === "X" ? "#0ea5e9" : "#f43f5e",
//                   transform: v ? "scale(1)" : "scale(0.6)",
//                   opacity: v ? 1 : 0,
//                 }}>
//                   {v || ""}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {showWinner && (
//           <div style={styles.footer}>
//             <div style={{ ...styles.winnerPopup, borderColor: color }}>
//               <div style={{ fontSize: 20, fontWeight: 800, color }}>{msg}</div>
//               <button onClick={playAgain} style={styles.retryBtn}>Play Again</button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function PlayerTag({ name, score, active }) {
//   return (
//     <div style={{
//       ...styles.playerTag,
//       boxShadow: active ? "0 0 0 6px rgba(34,197,94,0.15)" : "none",
//       borderColor: active ? "#22c55e" : "#e5e7eb"
//     }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <div style={{
//           width: 10, height: 10, borderRadius: "50%",
//           background: active ? "#22c55e" : "#94a3b8",
//           boxShadow: active ? "0 0 18px rgba(34,197,94,0.7)" : "none",
//           transition: "all .2s ease"
//         }} />
//         <span style={{ fontWeight: 700 }}>{name}</span>
//       </div>
//       <span style={{ color: "#64748b", fontWeight: 700 }}>Score: {score}</span>
//     </div>
//   );
// }

// const styles = {
//   shell: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" },
//   card: { width: "100%", maxWidth: 560, background: "#ffffff", borderRadius: 18, boxShadow: "0 12px 40px rgba(2,6,23,0.08)", padding: 20, display: "grid", gap: 16 },
//   banner: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 },
//   bannerCenter: { justifySelf: "center" },
//   status: { fontWeight: 800, fontSize: 14, letterSpacing: 0.2 },
//   playerTag: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "2px solid #e5e7eb", borderRadius: 12, padding: "8px 12px", background: "#fff", transition: "box-shadow .2s ease, border-color .2s ease" },
//   boardWrap: { display: "flex", alignItems: "center", justifyContent: "center", padding: 6 },
//   board: { display: "grid", gridTemplateColumns: "repeat(3, 110px)", gridTemplateRows: "repeat(3, 110px)", gap: 10 },
//   cell: { width: 110, height: 110, borderRadius: 14, border: "2px solid #e5e7eb", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform .06s ease, background .15s ease, border-color .15s ease" },
//   mark: { fontSize: 44, fontWeight: 900, lineHeight: 1, transition: "transform .18s cubic-bezier(.2,.8,.2,1), opacity .16s ease" },
//   footer: { display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4 },
//   winnerPopup: { border: "2px solid", background: "#ffffff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 10px 30px rgba(2,6,23,0.08)", display: "flex", alignItems: "center", gap: 12 },
//   retryBtn: { padding: "8px 12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
// };

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api } from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

function useConfetti() {
  const burst = () => {
    const colors = ["#22c55e","#0ea5e9","#a78bfa","#f97316","#ef4444","#eab308"];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = "0px";
      el.style.width = "8px";
      el.style.height = "8px";
      el.style.background = colors[Math.floor(Math.random()*colors.length)];
      el.style.borderRadius = "50%";
      el.style.opacity = "0.9";
      el.style.zIndex = "9999";
      el.style.transform = `translateY(0)`;
      el.style.transition = `transform ${1 + Math.random()}s cubic-bezier(.2,.8,.2,1), opacity .3s ease ${0.9+Math.random()*0.3}s`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translateY(${80 + Math.random()*90}vh)`;
        setTimeout(() => {
          el.style.opacity = "0";
          setTimeout(() => el.remove(), 400);
        }, 1200);
      });
    }
  };
  return { burst };
}

function toScores(players) {
  const out = { X: 0, O: 0 };
  for (const p of players || []) {
    if (p?.symbol === "X") out.X = p.wins || 0;
    if (p?.symbol === "O") out.O = p.wins || 0;
  }
  return out;
}

export default function TicTacToe() {
  const nav = useNavigate();
  const { roomId } = useParams();
  const [me, setMe] = useState(null);
  const [players, setPlayers] = useState([]);
  const [state, setState] = useState({ board: Array(9).fill(null), turn: "X", winner: null, moves: 0 });
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [showWinner, setShowWinner] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const socketRef = useRef(null);
  const mySymbolRef = useRef(null);
  const { burst } = useConfetti();

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await api.get("/api/profile/me");
      if (!alive) return;
      setMe(res.data);
      const s = io(import.meta.env.VITE_SOCKET_URL + "/tictactoe", { withCredentials: true });
      socketRef.current = s;
      s.emit("joinRoom", { roomId, userId: res.data.id, username: res.data.username });

      s.on("roomUpdate", (r) => {
        const list = r.players || [];
        setPlayers(list);
        setScores(toScores(list)); // sync from server every time
        const started = list.length === 2;
        setStatus(started ? "" : "Waiting for opponent…");
      });

      s.on("gameState", (gs) => {
        setState(gs);
        if (!gs.winner) setShowWinner(null);
      });

      s.on("gameOver", ({ winner }) => {
        setShowWinner(winner);
        if (winner && winner !== "draw" && winner === mySymbolRef.current) {
          burst();
        }
        // scores will be reflected by the roomUpdate the server emits
      });

      s.on("errorMsg", (m) => setStatus(m));
    })();
    return () => { alive = false; socketRef.current?.disconnect(); };
  }, [roomId]);

  const mySymbol = useMemo(() => players.find(p => p.username === me?.username)?.symbol, [players, me]);
  useEffect(() => { mySymbolRef.current = mySymbol; }, [mySymbol]);

  const started = players.length === 2;
  const yourTurn = started && mySymbol && state.turn === mySymbol && !state.winner;
  const opponentTurn = started && mySymbol && state.turn !== mySymbol && !state.winner;
  const turnMsg = state.winner ? "" : (!started ? "Waiting for opponent…" : yourTurn ? "Your Turn" : "Opponent’s Turn");

  const canPlay = (i) => started && mySymbol && state.turn === mySymbol && !state.winner && !state.board[i];
  const clickCell = (i) => { if (canPlay(i)) socketRef.current.emit("playerMove", { index: i }); };
  const playAgain = () => { setShowWinner(null); socketRef.current.emit("restart"); };

  const isDraw = showWinner === "draw";
  const iWon  = showWinner && showWinner !== "draw" && showWinner === mySymbol;
  const msg   = isDraw ? "Draw Game" : iWon ? "You Win!" : "You lose — try again";
  const color = isDraw ? "#64748b" : iWon ? "#22c55e" : "#ef4444";

  const restart = () => socketRef.current?.emit("restart");
  const backToLobby = () => nav("/");

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.banner}>
          <PlayerTag
            name={`${me?.username || "You"} ${mySymbol ? `(${mySymbol})` : ""}`}
            score={mySymbol ? scores[mySymbol] : 0}
            active={yourTurn}
          />
          <div style={styles.bannerCenter}>
            <span style={{
              ...styles.status,
              color: !started ? "#64748b" : yourTurn ? "#22c55e" : opponentTurn ? "#eab308" : "#64748b"
            }}>
              {turnMsg}
            </span>
          </div>
          <PlayerTag
            name={players.find(p => p.username !== me?.username)?.username || "Opponent"}
            score={mySymbol ? scores[mySymbol === "X" ? "O" : "X"] : 0}
            active={opponentTurn}
          />
        </div>

        <div style={styles.boardWrap}>
          <div style={styles.board}>
            {state.board.map((v, i) => (
              <button
                key={i}
                onClick={() => clickCell(i)}
                style={{
                  ...styles.cell,
                  cursor: canPlay(i) ? "pointer" : "not-allowed",
                  background: v ? "#0ea5e908" : canPlay(i) ? "#f8fafc" : "#ffffff",
                  borderColor: v ? "#38bdf8" : "#e5e7eb",
                  transform: canPlay(i) ? "translateY(-1px)" : "none",
                }}
              >
                <span style={{
                  ...styles.mark,
                  color: v === "X" ? "#0ea5e9" : "#f43f5e",
                  transform: v ? "scale(1)" : "scale(0.6)",
                  opacity: v ? 1 : 0,
                }}>
                  {v || ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.controlsRow}>
          <button onClick={restart} style={styles.primaryBtn}>Restart</button>
          <button onClick={backToLobby} style={styles.secondaryBtn}>Back to Lobby</button>
        </div>

        {showWinner && (
          <div style={styles.footer}>
            <div style={{ ...styles.winnerPopup, borderColor: color }}>
              <div style={{ fontSize: 20, fontWeight: 800, color }}>{msg}</div>
              <button onClick={playAgain} style={styles.retryBtn}>Play Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerTag({ name, score, active }) {
  return (
    <div style={{
      ...styles.playerTag,
      boxShadow: active ? "0 0 0 6px rgba(34,197,94,0.15)" : "none",
      borderColor: active ? "#22c55e" : "#e5e7eb"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: active ? "#22c55e" : "#94a3b8",
          boxShadow: active ? "0 0 18px rgba(34,197,94,0.7)" : "none",
          transition: "all .2s ease"
        }} />
        <span style={{ fontWeight: 700 }}>{name}</span>
      </div>
      <span style={{ color: "#64748b", fontWeight: 700 }}>Score: {score}</span>
    </div>
  );
}

const styles = {
  shell: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" },
  card: { width: "100%", maxWidth: 560, background: "#ffffff", borderRadius: 18, boxShadow: "0 12px 40px rgba(2,6,23,0.08)", padding: 20, display: "grid", gap: 16 },
  banner: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 },
  bannerCenter: { justifySelf: "center" },
  status: { fontWeight: 800, fontSize: 14, letterSpacing: 0.2 },
  playerTag: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, border: "2px solid #e5e7eb", borderRadius: 12, padding: "8px 12px", background: "#fff", transition: "box-shadow .2s ease, border-color .2s ease" },
  boardWrap: { display: "flex", alignItems: "center", justifyContent: "center", padding: 6 },
  board: { display: "grid", gridTemplateColumns: "repeat(3, 110px)", gridTemplateRows: "repeat(3, 110px)", gap: 10 },
  cell: { width: 110, height: 110, borderRadius: 14, border: "2px solid #e5e7eb", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform .06s ease, background .15s ease, border-color .15s ease" },
  mark: { fontSize: 44, fontWeight: 900, lineHeight: 1, transition: "transform .18s cubic-bezier(.2,.8,.2,1), opacity .16s ease" },
  controlsRow: { display: "flex", justifyContent: "center", gap: 10, marginTop: 4 },
  footer: { display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 4 },
  winnerPopup: { border: "2px solid", background: "#ffffff", borderRadius: 14, padding: "12px 16px", boxShadow: "0 10px 30px rgba(2,6,23,0.08)", display: "flex", alignItems: "center", gap: 12 },
  primaryBtn: { padding: "8px 12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", fontWeight: 700, cursor: "pointer" },
  secondaryBtn: { padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#0f172a", fontWeight: 700, cursor: "pointer" },
  retryBtn: { padding: "8px 12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
};
