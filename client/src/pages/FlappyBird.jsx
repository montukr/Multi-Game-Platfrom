// App.js
import React, { useState, useEffect } from "react";

export default function App() {
  const [birdY, setBirdY] = useState(200);
  const [birdVel, setBirdVel] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const gravity = 0.5;
  const jumpStrength = -8;

  const jump = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) setGameStarted(true);
    setBirdVel(jumpStrength);
  };

  const resetGame = () => {
    setBirdY(200);
    setBirdVel(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // bird physics
      setBirdVel((v) => v + gravity);
      setBirdY((y) => y + birdVel);

      // move pipes
      setPipes((prev) =>
        prev
          .map((pipe) => ({ ...pipe, x: pipe.x - 3 }))
          .filter((pipe) => pipe.x + 100 > 0)
      );

      // generate pipes
      if (pipes.length === 0 || pipes[pipes.length - 1].x < 250) {
        const topY = Math.floor(Math.random() * 200) - 150;
        setPipes((prev) => [...prev, { x: 600, y: topY }]);
      }

      // check collisions
      const birdRect = { top: birdY, bottom: birdY + 50, left: 50, right: 100 };
      for (let pipe of pipes) {
        const pipeRect = { top: pipe.y, bottom: pipe.y + 600, left: pipe.x, right: pipe.x + 100 };
        const overlap =
          birdRect.right > pipeRect.left &&
          birdRect.left < pipeRect.right &&
          birdRect.bottom > pipeRect.top &&
          birdRect.top < pipeRect.bottom;
        if (overlap || birdY > 550 || birdY < 0) {
          setGameOver(true);
          setGameStarted(false);
          clearInterval(gameLoop);
          return;
        }
      }

      // scoring
      pipes.forEach((pipe) => {
        if (pipe.x + 100 === 50) setScore((s) => s + 1);
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, birdVel, pipes]);

  return (
    <div
      onClick={jump}
      style={{
        position: "relative",
        width: "600px",
        height: "600px",
        border: "1px solid #000",
        overflow: "hidden",
        backgroundColor: gameOver ? "#ff6347" : "#87ceeb",
        margin: "0 auto",
        transition: "background-color 0.5s ease",
        cursor: "pointer",
      }}
    >
      {/* Bird */}
      <img
        src="https://media.geeksforgeeks.org/wp-content/uploads/20231211115925/flappy_bird_by_jubaaj_d93bpnj.gif"
        alt="bird"
        style={{
          position: "absolute",
          width: "50px",
          height: "50px",
          left: 50,
          top: birdY,
          userSelect: "none",
        }}
        draggable={false}
      />

      {/* Pipes */}
      {pipes.map((pipe, i) => (
        <img
          key={i}
          src="https://media.geeksforgeeks.org/wp-content/uploads/20231211115753/6d2a698f31595a1.png"
          alt="pipe"
          style={{
            position: "absolute",
            width: "100px",
            height: "600px",
            left: pipe.x,
            top: pipe.y,
            userSelect: "none",
          }}
          draggable={false}
        />
      ))}

      {/* UI */}
      {gameStarted && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: 24,
            fontWeight: "bold",
            color: "#fff",
            textShadow: "1px 1px 2px black",
          }}
        >
          Score: {score}
        </div>
      )}

      {!gameStarted && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 24,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          Click or Press Space to Start
        </div>
      )}

      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Game Over
          <br />
          <p
            style={{
              backgroundColor: "blue",
              padding: "4px 8px",
              borderRadius: "5px",
              display: "inline-block",
              marginTop: "8px",
            }}
          >
            Click or Press Space to Restart
          </p>
        </div>
      )}
    </div>
  );
}
