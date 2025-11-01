import { useState, useEffect } from "react";

function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.includes(null) ? null : "draw";
}

// Simple minimax AI
function aiMove(board, ai, human) {
  const winner = checkWinner(board);
  if (winner === ai) return { score: 1 };
  if (winner === human) return { score: -1 };
  if (winner === "draw") return { score: 0 };

  const moves = [];
  board.forEach((cell, i) => {
    if (!cell) {
      const newBoard = [...board];
      newBoard[i] = ai;
      const result = aiMove(newBoard, human, ai);
      moves.push({ index: i, score: -result.score });
    }
  });

  const best = moves.reduce((a, b) => (a.score > b.score ? a : b));
  return best;
}

export default function TicTacToeSingle() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const w = checkWinner(board);
    if (w) setWinner(w);
  }, [board]);

  useEffect(() => {
    if (turn === "O" && !winner) {
      const { index } = aiMove(board, "O", "X");
      if (index !== undefined) {
        setTimeout(() => {
          const newBoard = [...board];
          newBoard[index] = "O";
          setBoard(newBoard);
          setTurn("X");
        }, 400);
      }
    }
  }, [turn, board, winner]);

  function handleClick(i) {
    if (winner || board[i] || turn !== "X") return;
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setTurn("O");
  }

  function handleReplay() {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setWinner(null);
  }

  const btnStyle = {
    marginTop: 15,
    padding: "8px 16px",
    borderRadius: 8,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: 600
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Single Player Tic Tac Toe</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 100px)",
        gap: 10,
        justifyContent: "center"
      }}>
        {board.map((cell, i) => (
          <button key={i}
            onClick={() => handleClick(i)}
            style={{
              width: 100, height: 100, fontSize: 36,
              background: cell ? "#eef" : "#fff"
            }}
          >
            {cell}
          </button>
        ))}
      </div>
      {winner && (
        <div style={{ marginTop: 20, fontWeight: "bold" }}>
          {winner === "draw" ? "Draw!" : `${winner} Wins!`}
          <div>
            <button onClick={handleReplay} style={btnStyle}>Replay</button>
          </div>
        </div>
      )}
    </div>
  );
}
