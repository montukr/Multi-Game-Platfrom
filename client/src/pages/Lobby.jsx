// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/axios";
// import tttImg from "../assets/ttt.jpg";
// import chessImg from "../assets/chess.jpg";
// import snakeImg from "../assets/snake.jpg";
// import tetrisImg from "../assets/tetris.jpg";
// import flappyImg from "../assets/flappy.jpg";
// import pacmanImg from "../assets/pacman.jpg";
// export default function Lobby() {
//   const nav = useNavigate();
//   const [tttRoom, setTttRoom] = useState("");
//   const [chessRoom, setChessRoom] = useState("");
//   const [tttList, setTttList] = useState([]);
//   const [chessList, setChessList] = useState([]);

//   useEffect(() => {
//     let on = true;
//     const load = async () => {
//       const [a, b] = await Promise.all([
//         api.get("/api/rooms/tictactoe"),
//         api.get("/api/rooms/chess"),
//       ]);
//       if (!on) return;
//       setTttList(a.data || []);
//       setChessList(b.data || []);
//     };
//     load();
//     const id = setInterval(load, 4000);
//     return () => {
//       on = false;
//       clearInterval(id);
//     };
//   }, []);

//   function smartJoin(path, id, list) {
//     const rid = (id || "").trim();
//     if (!rid) {
//       alert("Enter a room ID");
//       return;
//     }
//     const matches = (list || []).filter((r) => r.id === rid);
//     if (matches.length === 1) nav(`/${path}/${rid}`);
//     else if (matches.length > 1)
//       alert(`Multiple rooms found for ${rid}. Choose one below.`);
//     else nav(`/${path}/${rid}`);
//   }

//   return (
//     <div>
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
//         <button onClick={() => nav("/profile")} style={btnPrimary}>
//           Profile
//         </button>
//       </div>

//       <div
//         style={{
//           display: "grid",
//           gap: 24,
//           gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
//         }}
//       >
//         {/* Tic Tac Toe */}
//         <GameStack
//           title="Tic-Tac-Toe"
//           description="Enter a Room ID to join."
//           image={tttImg}
//           input={{
//             placeholder: "Enter room ID",
//             value: tttRoom,
//             onChange: setTttRoom,
//           }}
//           onJoin={() => smartJoin("tictactoe", tttRoom, tttList)}
//           onPlayVsAI={() => nav("/tictactoe/single")}
//           rooms={tttRoom ? tttList.filter((r) => r.id === tttRoom) : tttList}
//           onQuickJoin={(id) => nav(`/tictactoe/${id}`)}
//         />

//         {/* Chess */}
//         <GameStack
//           title="Chess"
//           description="Enter a Room ID to join."
//           image={chessImg}
//           input={{
//             placeholder: "Enter room ID",
//             value: chessRoom,
//             onChange: setChessRoom,
//           }}
//           onJoin={() => smartJoin("chess", chessRoom, chessList)}
//           onPlayVsAI={() => nav("/chess/single")}
//           rooms={chessRoom ? chessList.filter((r) => r.id === chessRoom) : chessList}
//           onQuickJoin={(id) => nav(`/chess/${id}`)}
//         />

//         {/* Snake */}
//         <GameStack
//           title="Snake"
//           description="Offline classic; keyboard and touch."
//           image={snakeImg}
//           onJoin={() => nav("/snake")}
//         />

//         {/* Tetris */}
//         <GameStack
//           title="Tetris"
//           description="Stack blocks, climb the leaderboard."
//           image={tetrisImg}
//           onJoin={() => nav("/tetris")}
//         />

//         {/* Flappy Bird */}
//         <GameStack
//           title="Flappy Bird"
//           description="Tap or press space to fly. Try not to crash!"
//           image={flappyImg}
//           onJoin={() => nav("/flappybird")}
//         />

//         {/* Pac Man */}
//         <GameStack
//           title="Pac-Man"
//           description="Eat dots, dodge ghosts, survive as long as you can."
//           image={pacmanImg}
//           onJoin={() => nav("/pacman")}
//         />
//       </div>
//     </div>
//   );
// }

// function GameStack({
//   title,
//   description,
//   image,
//   input,
//   onJoin,
//   onPlayVsAI,
//   rooms = [],
//   onQuickJoin,
// }) {
//   return (
//     <div style={card}>
//       <div style={{ position: "relative", height: 180 }}>
//         <img
//           src={image}
//           alt={title}
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//             opacity: 0.9,
//           }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background:
//               "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.8) 100%)",
//           }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             bottom: 12,
//             left: 16,
//             color: "white",
//           }}
//         >
//           <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
//           <p style={{ margin: "4px 0 0 0", opacity: 0.9 }}>{description}</p>
//         </div>
//       </div>

//       <div style={{ padding: 16, display: "grid", gap: 12 }}>
//         {input ? (
//           <div style={{ display: "flex", gap: 8 }}>
//             <input
//               placeholder={input.placeholder}
//               value={input.value}
//               onChange={(e) => input.onChange(e.target.value)}
//               style={inputStyle}
//             />
//             <button onClick={onJoin} style={btnPrimary}>
//               Join
//             </button>
//           </div>
//         ) : (
//           <button onClick={onJoin} style={{ ...btnPrimary, width: "100%" }}>
//             Play
//           </button>
//         )}

//         {onPlayVsAI && (
//           <button onClick={onPlayVsAI} style={btnSecondary}>
//             Play vs AI
//           </button>
//         )}

//         {rooms.length > 0 && (
//           <div style={{ display: "grid", gap: 8 }}>
//             <p style={{ margin: "2px 0", color: "#6b7280", fontWeight: 600 }}>
//               Available rooms
//             </p>
//             {rooms.map((r) => (
//               <button
//                 key={`${r.id}-${r.winner || "live"}`}
//                 onClick={() => onQuickJoin(r.id)}
//                 style={roomItem}
//               >
//                 <span style={{ color: "#0f172a", fontWeight: 700 }}>{r.id}</span>
//                 <span
//                   style={{
//                     color: r.winner ? "#ef4444" : "#6b7280",
//                     fontSize: 12,
//                   }}
//                 >
//                   {r.winner
//                     ? `Winner: ${r.winner}`
//                     : r.players?.map((p) => p.username).join(", ") || "Empty"}
//                 </span>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// const btnPrimary = {
//   padding: "8px 12px",
//   borderRadius: 10,
//   background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
//   color: "#fff",
//   border: "none",
//   cursor: "pointer",
//   fontWeight: 700,
// };

// const btnSecondary = {
//   padding: "8px 12px",
//   borderRadius: 10,
//   background: "#e2e8f0",
//   color: "#0f172a",
//   border: "none",
//   cursor: "pointer",
//   fontWeight: 700,
// };

// const card = {
//   borderRadius: 18,
//   overflow: "hidden",
//   boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
//   background: "#fff",
//   display: "flex",
//   flexDirection: "column",
// };

// const inputStyle = {
//   flex: 1,
//   padding: 12,
//   borderRadius: 12,
//   border: "1px solid #e5e7eb",
//   background: "#f8fafc",
// };

// const roomItem = {
//   width: "100%",
//   textAlign: "left",
//   padding: 12,
//   borderRadius: 12,
//   border: "1px solid #e5e7eb",
//   background: "#ffffff",
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
// };
  
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import tttImg from "../assets/ttt.jpg";
import chessImg from "../assets/chess.jpg";
import snakeImg from "../assets/snake.jpg";
import tetrisImg from "../assets/tetris.jpg";
import flappyImg from "../assets/flappy.jpg";
import pacmanImg from "../assets/pacman.jpg";

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
    return () => {
      on = false;
      clearInterval(id);
    };
  }, []);

  function smartJoin(path, id, list) {
    const rid = (id || "").trim();
    if (!rid) {
      alert("Enter a room ID");
      return;
    }
    const matches = (list || []).filter((r) => r.id === rid);
    if (matches.length === 1) nav(`/${path}/${rid}`);
    else if (matches.length > 1)
      alert(`Multiple rooms found for ${rid}. Choose one below.`);
    else nav(`/${path}/${rid}`);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, gap: 8 }}>
        <button onClick={() => nav("/leaderboard")} style={btnSecondary}>
          Leaderboard
        </button>
        <button onClick={() => nav("/profile")} style={btnPrimary}>
          Profile
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {/* Tic Tac Toe */}
        <GameStack
          title="Tic-Tac-Toe"
          description="Enter a Room ID to join."
          image={tttImg}
          input={{
            placeholder: "Enter room ID",
            value: tttRoom,
            onChange: setTttRoom,
          }}
          onJoin={() => smartJoin("tictactoe", tttRoom, tttList)}
          onPlayVsAI={() => nav("/tictactoe/single")}
          rooms={tttRoom ? tttList.filter((r) => r.id === tttRoom) : tttList}
          onQuickJoin={(id) => nav(`/tictactoe/${id}`)}
        />

        {/* Chess */}
        <GameStack
          title="Chess"
          description="Enter a Room ID to join."
          image={chessImg}
          input={{
            placeholder: "Enter room ID",
            value: chessRoom,
            onChange: setChessRoom,
          }}
          onJoin={() => smartJoin("chess", chessRoom, chessList)}
          onPlayVsAI={() => nav("/chess/single")}
          rooms={chessRoom ? chessList.filter((r) => r.id === chessRoom) : chessList}
          onQuickJoin={(id) => nav(`/chess/${id}`)}
        />

        {/* Snake */}
        <GameStack
          title="Snake"
          description="Offline classic; keyboard and touch."
          image={snakeImg}
          onJoin={() => nav("/snake")}
        />

        {/* Tetris */}
        <GameStack
          title="Tetris"
          description="Stack blocks, climb the leaderboard."
          image={tetrisImg}
          onJoin={() => nav("/tetris")}
        />

        {/* Flappy Bird */}
        <GameStack
          title="Flappy Bird"
          description="Tap or press space to fly. Try not to crash!"
          image={flappyImg}
          onJoin={() => nav("/flappybird")}
        />

        {/* Pac Man */}
        <GameStack
          title="Pac-Man"
          description="Eat dots, dodge ghosts, survive as long as you can."
          image={pacmanImg}
          onJoin={() => nav("/pacman")}
        />
      </div>
    </div>
  );
}

function GameStack({
  title,
  description,
  image,
  input,
  onJoin,
  onPlayVsAI,
  rooms = [],
  onQuickJoin,
}) {
  return (
    <div style={card}>
      <div style={{ position: "relative", height: 180 }}>
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.8) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 16,
            color: "white",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
          <p style={{ margin: "4px 0 0 0", opacity: 0.9 }}>{description}</p>
        </div>
      </div>

      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        {input ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder={input.placeholder}
              value={input.value}
              onChange={(e) => input.onChange(e.target.value)}
              style={inputStyle}
            />
            <button onClick={onJoin} style={btnPrimary}>
              Join
            </button>
          </div>
        ) : (
          <button onClick={onJoin} style={{ ...btnPrimary, width: "100%" }}>
            Play
          </button>
        )}

        {onPlayVsAI && (
          <button onClick={onPlayVsAI} style={btnSecondary}>
            Play vs AI
          </button>
        )}

        {rooms.length > 0 && (
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ margin: "2px 0", color: "#6b7280", fontWeight: 600 }}>
              Available rooms
            </p>
            {rooms.map((r) => (
              <button
                key={`${r.id}-${r.winner || "live"}`}
                onClick={() => onQuickJoin(r.id)}
                style={roomItem}
              >
                <span style={{ color: "#0f172a", fontWeight: 700 }}>{r.id}</span>
                <span
                  style={{
                    color: r.winner ? "#ef4444" : "#6b7280",
                    fontSize: 12,
                  }}
                >
                  {r.winner
                    ? `Winner: ${r.winner}`
                    : r.players?.map((p) => p.username).join(", ") || "Empty"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const btnPrimary = {
  padding: "8px 12px",
  borderRadius: 10,
  background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

const btnSecondary = {
  padding: "8px 12px",
  borderRadius: 10,
  background: "#e2e8f0",
  color: "#0f172a",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

const card = {
  borderRadius: 18,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  flex: 1,
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
};

const roomItem = {
  width: "100%",
  textAlign: "left",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
