import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export default function Lobby() {
  const nav = useNavigate();
  const [tttRoom, setTttRoom] = useState("");
  const [chessRoom, setChessRoom] = useState("");
  const [tttList, setTttList] = useState([]);
  const [chessList, setChessList] = useState([]);

  useEffect(() => {
    let on = true;
    const load = async () => {
      const [a, b] = await Promise.all([
        api.get("/api/rooms/tictactoe"),
        api.get("/api/rooms/chess"),
      ]);
      if (!on) return;
      setTttList(a.data || []);
      setChessList(b.data || []);
    };
    load();
    const id = setInterval(load, 4000);
    return () => { on = false; clearInterval(id); };
  }, []);

  function safeJoin(path, id) {
    const room = (id || "").trim();
    if (!room) { alert("Enter a room ID"); return; }
    nav(`/${path}/${room}`);
  }

  return (
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
      <GameCard
        title="Tic‑Tac‑Toe"
        description="Play real‑time"
        inputValue={tttRoom}
        onInput={setTttRoom}
        onJoin={() => safeJoin("tictactoe", tttRoom)}
        list={tttList}
        onQuickJoin={(id) => nav(`/tictactoe/${id}`)}
      />
      <GameCard
        title="Chess"
        description="Real‑time chess"
        inputValue={chessRoom}
        onInput={setChessRoom}
        onJoin={() => safeJoin("chess", chessRoom)}
        list={chessList}
        onQuickJoin={(id) => nav(`/chess/${id}`)}
      />
      <GameCard
        title="Snake"
        description="Offline classic snake"
        hideInput
        onJoin={() => nav("/snake")}
      />
    </div>
  );
}

function GameCard({ title, description, inputValue, onInput, onJoin, hideInput, list = [], onQuickJoin }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", background: "#fff" }}>
      <h3 style={{ margin: "0 0 6px 0" }}>{title}</h3>
      <p style={{ margin: "0 0 12px 0", color: "#6b7280" }}>{description}</p>
      {!hideInput && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Room ID"
            value={inputValue}
            onChange={(e) => onInput(e.target.value)}
            style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <button onClick={onJoin} style={{ padding: "10px 12px", borderRadius: 10, background: "#0ea5e9", color: "#fff", border: "none" }}>
            Join
          </button>
        </div>
      )}
      {list.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: "6px 0", color: "#6b7280" }}>Available rooms</p>
          {list.map(r => (
            <button key={r.id} onClick={() => onQuickJoin(r.id)} style={{
              width: "100%", textAlign: "left", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", marginTop: 6, background: "#f8fafc"
            }}>
              {r.id} • {r.players.map(p => p.username).join(", ") || "Empty"}
            </button>
          ))}
        </div>
      )}
      {hideInput && (
        <button onClick={onJoin} style={{ width: "100%", padding: 10, borderRadius: 10, background: "#0ea5e9", color: "#fff", border: "none", marginTop: 8 }}>
          Play
        </button>
      )}
    </div>
  );
}
