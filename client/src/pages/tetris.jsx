import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

const ROWS = 20;
const COLS = 10;
const COLORS = {
  I: "#06b6d4",
  O: "#facc15",
  T: "#a855f7",
  S: "#22c55e",
  Z: "#ef4444",
  J: "#3b82f6",
  L: "#f97316",
};

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};

export default function TetrisSingle() {
  const nav = useNavigate();
  const [board, setBoard] = useState(createEmptyBoard());
  const [current, setCurrent] = useState(randomPiece());
  const [pos, setPos] = useState({ r: 0, c: 3 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(""));
  }

  function randomPiece() {
    const keys = Object.keys(SHAPES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    return { type, shape: SHAPES[type] };
  }

  function mergePiece(tempBoard, piece, r, c) {
    const newBoard = tempBoard.map(row => [...row]);
    piece.shape.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val && r + i >= 0) newBoard[r + i][c + j] = piece.type;
      });
    });
    return newBoard;
  }

  function collision(piece, r, c, grid) {
    return piece.shape.some((row, i) =>
      row.some((val, j) => {
        if (!val) return false;
        const y = r + i, x = c + j;
        return y >= ROWS || x < 0 || x >= COLS || (y >= 0 && grid[y][x]);
      })
    );
  }

  function rotate(piece) {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    );
    return { ...piece, shape: rotated };
  }

  function freeze() {
    const merged = mergePiece(board, current, pos.r, pos.c);
    const [cleared, newBoard] = clearLines(merged);
    if (cleared > 0) setScore(s => s + cleared * 100);
    setBoard(newBoard);
    const next = randomPiece();
    if (collision(next, 0, 3, newBoard)) {
      setGameOver(true);
      clearInterval(intervalRef.current);
      saveScore(score);
      return;
    }
    setCurrent(next);
    setPos({ r: 0, c: 3 });
  }

  function clearLines(grid) {
    const newGrid = grid.filter(row => row.some(cell => !cell));
    const cleared = ROWS - newGrid.length;
    while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(""));
    return [cleared, newGrid];
  }

  function moveDown() {
    if (!collision(current, pos.r + 1, pos.c, board)) {
      setPos(p => ({ ...p, r: p.r + 1 }));
    } else {
      freeze();
    }
  }

  function moveLeft() {
    if (!collision(current, pos.r, pos.c - 1, board))
      setPos(p => ({ ...p, c: p.c - 1 }));
  }

  function moveRight() {
    if (!collision(current, pos.r, pos.c + 1, board))
      setPos(p => ({ ...p, c: p.c + 1 }));
  }

  function rotatePiece() {
    const rot = rotate(current);
    if (!collision(rot, pos.r, pos.c, board)) setCurrent(rot);
  }

  function handleKey(e) {
    if (gameOver) return;
    const k = e.key.toLowerCase();
    if (["arrowleft", "a"].includes(k)) moveLeft();
    if (["arrowright", "d"].includes(k)) moveRight();
    if (["arrowdown", "s"].includes(k)) moveDown();
    if (["arrowup", "w"].includes(k)) rotatePiece();
  }

  async function saveScore(finalScore) {
    try {
      await api.post("/api/scores/tetris", { score: finalScore });
    } catch (e) {
      console.warn("Failed to save score", e);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    intervalRef.current = setInterval(moveDown, 600);
    return () => {
      window.removeEventListener("keydown", handleKey);
      clearInterval(intervalRef.current);
    };
  }, [board, current, pos]);

  const displayBoard = mergePiece(board, current, pos.r, pos.c);

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Tetris</h2>
          <span style={styles.badge}>
            {gameOver ? `Game Over — Score: ${score}` : `Score: ${score}`}
          </span>
        </div>

        <div style={styles.board}>
          {displayBoard.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                style={{
                  ...styles.cell,
                  background: cell ? COLORS[cell] : "#f8fafc",
                }}
              />
            ))
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.primaryBtn} onClick={() => window.location.reload()}>
            Restart
          </button>
          <button style={styles.secondaryBtn} onClick={() => nav("/")}>
            Back to Lobby
          </button>
        </div>

        {/* Touch Controls */}
        {!gameOver && (
          <div style={styles.touchControls}>
            <button onClick={moveLeft} style={styles.touchBtn}>⬅️</button>
            <button onClick={rotatePiece} style={styles.touchBtn}>🔄</button>
            <button onClick={moveRight} style={styles.touchBtn}>➡️</button>
            <button onClick={moveDown} style={styles.touchBtn}>⬇️</button>
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
    background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 12px 40px rgba(2,6,23,0.08)",
    padding: 16,
    display: "grid",
    gap: 12,
    textAlign: "center",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  badge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
  },
  board: {
    display: "grid",
    gridTemplateColumns: `repeat(${COLS}, 28px)`,
    gridTemplateRows: `repeat(${ROWS}, 28px)`,
    border: "6px solid #262626",
    borderRadius: 12,
    overflow: "hidden",
    margin: "0 auto",
  },
  cell: { width: 28, height: 28, border: "1px solid #cbd5e1" },
  footer: { display: "flex", justifyContent: "center", gap: 12, marginTop: 8 },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
  touchControls: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  touchBtn: {
    width: 60,
    height: 60,
    borderRadius: 12,
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    background: "#e2e8f0",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
};
