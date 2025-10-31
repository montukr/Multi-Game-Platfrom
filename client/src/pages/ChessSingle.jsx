import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chess } from "chess.js";

const icon = (p) => ({
  P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
  p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
}[p] || "");

export default function ChessSingle() {
  const nav = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [turn, setTurn] = useState("w");
  const [winner, setWinner] = useState(null);
  const [sel, setSel] = useState(null);

  const myColor = "w";
  const myTurn = turn === myColor && !winner;

  useEffect(() => {
    if (turn === "b" && !winner) {
      setTimeout(() => {
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) {
          setWinner("w");
          return;
        }
        const move = moves[Math.floor(Math.random() * moves.length)];
        game.move(move);
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setBoard(newGame.board());
        setTurn(newGame.turn());
        if (newGame.isGameOver()) {
          setWinner(newGame.isDraw() ? "draw" : "b");
        }
      }, 600);
    }
  }, [turn, winner, game]);

  function click(r, c) {
    if (!myTurn) return;
    const piece = board[r][c];
    const square = coordToSquare(r, c);

    // Deselect or switch selection
    if (sel && sel.r === r && sel.c === c) {
      setSel(null);
      return;
    }
    if (!sel) {
      if (!piece || piece.color !== "w") return;
      setSel({ r, c });
      return;
    }
    if (piece && piece.color === "w") {
      setSel({ r, c });
      return;
    }

    // Attempt move
    const move = game.move({ from: coordToSquare(sel.r, sel.c), to: square, promotion: "q" });
    if (move) {
      const newGame = new Chess(game.fen());
      setGame(newGame);
      setBoard(newGame.board());
      setTurn(newGame.turn());
      if (newGame.isGameOver()) {
        setWinner(newGame.isDraw() ? "draw" : "w");
      }
    }
    setSel(null);
  }

  function handleRestart() {
    const fresh = new Chess();
    setGame(fresh);
    setBoard(fresh.board());
    setTurn("w");
    setWinner(null);
    setSel(null);
  }

  const resultText = winner
    ? winner === "draw"
      ? "Draw"
      : winner === "w"
      ? "You Win!"
      : "You Lose"
    : myTurn
    ? "Your Move"
    : "AI Thinking…";

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Chess vs AI</h2>
          <span style={styles.badge}>{resultText}</span>
        </div>

        <div style={styles.boardWrap}>
          <div style={styles.board}>
            {board.map((row, r) =>
              row.map((cell, c) => {
                const dark = (r + c) % 2 === 1;
                const selected = sel && sel.r === r && sel.c === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => click(r, c)}
                    style={{
                      ...styles.square,
                      background: selected
                        ? "#fde68a"
                        : dark
                        ? "#769656"
                        : "#eeeed2",
                      color: cell?.color === "w" ? "#111827" : "#0f172a",
                    }}
                  >
                    <span style={{ fontSize: 34 }}>
                      {cell ? icon(cell.type === cell.type.toUpperCase() ? cell.type : (cell.color === "w" ? cell.type.toUpperCase() : cell.type)) : ""}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleRestart} style={styles.primaryBtn}>Restart</button>
          <button onClick={() => nav("/")} style={styles.secondaryBtn}>Back to Lobby</button>
        </div>
      </div>
    </div>
  );
}

function coordToSquare(r, c) {
  const files = "abcdefgh";
  return files[c] + (8 - r);
}

const styles = {
  shell: { minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" },
  card: { width: "100%", maxWidth: 700, background: "#ffffff", borderRadius: 18, boxShadow: "0 12px 40px rgba(2,6,23,0.08)", padding: 16, display: "grid", gap: 12 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  badge: { padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 13, background: "#e0f2fe", color: "#0369a1" },
  boardWrap: { display: "flex", alignItems: "center", justifyContent: "center" },
  board: { display: "grid", gridTemplateColumns: "repeat(8, 64px)", gridTemplateRows: "repeat(8, 64px)", gap: 0, border: "6px solid #262626", borderRadius: 12, overflow: "hidden" },
  square: { width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .12s ease" },
  footer: { display: "flex", justifyContent: "center", gap: 12, marginTop: 6 },
  primaryBtn: { padding: "10px 12px", borderRadius: 10, background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, boxShadow: "0 6px 16px rgba(14,165,233,0.35)" },
  secondaryBtn: { padding: "10px 12px", borderRadius: 10, background: "#e2e8f0", color: "#0f172a", border: "none", cursor: "pointer", fontWeight: 700 },
};
