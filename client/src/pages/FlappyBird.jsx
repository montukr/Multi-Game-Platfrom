// // App.js
// import React, { useState, useEffect, useRef } from "react";

// export default function App() {
//   const [birdY, setBirdY] = useState(250);
//   const [birdVel, setBirdVel] = useState(0);
//   const [pipes, setPipes] = useState([]);
//   const [score, setScore] = useState(0);
//   const [gameOver, setGameOver] = useState(false);
//   const [gameStarted, setGameStarted] = useState(false);

//   const gravity = 0.5;
//   const jumpStrength = -8;
//   const gameWidth = 600;
//   const gameHeight = 600;

//   const birdSize = 40;
//   const pipeWidth = 80;
//   const baseGap = 180;

//   const loopRef = useRef(null);

//   const jump = () => {
//     if (gameOver) {
//       resetGame();
//       return;
//     }
//     if (!gameStarted) setGameStarted(true);
//     setBirdVel(jumpStrength);
//   };

//   const resetGame = () => {
//     setBirdY(250);
//     setBirdVel(0);
//     setPipes([]);
//     setScore(0);
//     setGameOver(false);
//     setGameStarted(false);
//   };

//   // key controls
//   useEffect(() => {
//     const handleKey = (e) => {
//       if (e.code === "Space" || e.code === "ArrowUp") {
//         e.preventDefault();
//         jump();
//       }
//     };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   });

//   // main game loop
//   useEffect(() => {
//     if (!gameStarted || gameOver) return;

//     loopRef.current = setInterval(() => {
//       // update bird physics
//       setBirdVel((v) => v + gravity);
//       setBirdY((y) => y + birdVel);

//       // pipe movement and cleanup
//       setPipes((prev) => {
//         const updated = prev
//           .map((p) => ({ ...p, x: p.x - (3 + Math.min(score / 10, 3)) })) // speed up slowly
//           .filter((p) => p.x + pipeWidth > 0);

//         // add new pipe
//         if (updated.length === 0 || updated[updated.length - 1].x < gameWidth - 250) {
//           const topHeight = Math.random() * 200 + 50;
//           const gap = Math.max(baseGap - score * 3, 120); // gap shrinks slightly
//           updated.push({
//             x: gameWidth,
//             topHeight,
//             gap,
//             scored: false,
//           });
//         }

//         return updated;
//       });

//       // collision + scoring check
//       setPipes((prev) =>
//         prev.map((pipe) => {
//           const birdTop = birdY;
//           const birdBottom = birdY + birdSize;
//           const birdLeft = 100;
//           const birdRight = 100 + birdSize;

//           const topPipeBottom = pipe.topHeight;
//           const bottomPipeTop = pipe.topHeight + pipe.gap;

//           const pipeLeft = pipe.x;
//           const pipeRight = pipe.x + pipeWidth;

//           // collision check
//           const hit =
//             birdRight > pipeLeft &&
//             birdLeft < pipeRight &&
//             (birdTop < topPipeBottom || birdBottom > bottomPipeTop);

//           if (hit || birdY < 0 || birdY + birdSize > gameHeight) {
//             setGameOver(true);
//             clearInterval(loopRef.current);
//           }

//           // score check
//           if (!pipe.scored && pipe.x + pipeWidth < 100) {
//             setScore((s) => s + 1);
//             return { ...pipe, scored: true };
//           }
//           return pipe;
//         })
//       );
//     }, 30);

//     return () => clearInterval(loopRef.current);
//   }, [gameStarted, gameOver, birdVel, pipes, score]);

//   return (
//     <div
//       onClick={jump}
//       style={{
//         position: "relative",
//         width: `${gameWidth}px`,
//         height: `${gameHeight}px`,
//         border: "2px solid #000",
//         overflow: "hidden",
//         backgroundColor: gameOver ? "#e57373" : "#87ceeb",
//         margin: "40px auto",
//         cursor: "pointer",
//         transition: "background-color 0.4s ease",
//       }}
//     >
//       {/* Bird */}
//       <img
//         src="https://media.geeksforgeeks.org/wp-content/uploads/20231211115925/flappy_bird_by_jubaaj_d93bpnj.gif"
//         alt="bird"
//         style={{
//           position: "absolute",
//           width: birdSize,
//           height: birdSize,
//           left: 100,
//           top: birdY,
//           userSelect: "none",
//         }}
//         draggable={false}
//       />

//       {/* Pipes (simple rectangles) */}
//       {pipes.map((pipe, i) => (
//         <React.Fragment key={i}>
//           {/* top pipe */}
//           <div
//             style={{
//               position: "absolute",
//               backgroundColor: "#2ecc71",
//               width: pipeWidth,
//               height: pipe.topHeight,
//               left: pipe.x,
//               top: 0,
//               border: "2px solid #145a32", // added outline
//             }}
//           />
//           {/* bottom pipe */}
//           <div
//             style={{
//               position: "absolute",
//               backgroundColor: "#2ecc71",
//               width: pipeWidth,
//               height: gameHeight - (pipe.topHeight + pipe.gap),
//               left: pipe.x,
//               top: pipe.topHeight + pipe.gap,
//               border: "2px solid #145a32", // added outline
//             }}
//           />
//         </React.Fragment>
//       ))}

//       {/* Score */}
//       {gameStarted && !gameOver && (
//         <div
//           style={{
//             position: "absolute",
//             top: 10,
//             left: 10,
//             fontSize: 24,
//             fontWeight: "bold",
//             color: "#fff",
//             textShadow: "1px 1px 2px black",
//           }}
//         >
//           Score: {score}
//         </div>
//       )}

//       {/* Start prompt */}
//       {!gameStarted && !gameOver && (
//         <div
//           style={{
//             position: "absolute",
//             top: "45%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             fontSize: 24,
//             fontWeight: "bold",
//             color: "#fff",
//           }}
//         >
//           Click or Press Space to Start
//         </div>
//       )}

//       {/* Game Over */}
//       {gameOver && (
//         <div
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             textAlign: "center",
//             color: "white",
//             fontSize: "24px",
//             fontWeight: "bold",
//           }}
//         >
//           Game Over
//           <br />
//           <p
//             style={{
//               backgroundColor: "#1976d2",
//               padding: "4px 8px",
//               borderRadius: "5px",
//               display: "inline-block",
//               marginTop: "8px",
//             }}
//           >
//             Click or Press Space to Restart
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// FlappyBird.jsx
import React, { useState, useEffect, useRef } from "react";
import { api } from "../api/axios";

export default function App() {
  const [birdY, setBirdY] = useState(250);
  const [birdVel, setBirdVel] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gravity = 0.5;
  const jumpStrength = -8;
  const gameWidth = 600;
  const gameHeight = 600;

  const birdSize = 40;
  const pipeWidth = 80;
  const baseGap = 180;

  const loopRef = useRef(null);

  const jump = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) setGameStarted(true);
    setBirdVel(jumpStrength);
  };

  const resetGame = () => {
    setBirdY(250);
    setBirdVel(0);
    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
  };

  async function saveScore(finalScore) {
    try {
      await api.post("/api/scores/flappy/best", { score: finalScore });
    } catch (err) {
      console.warn("Failed to save Flappy Bird score", err);
    }
  }

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

    loopRef.current = setInterval(() => {
      setBirdVel((v) => v + gravity);
      setBirdY((y) => y + birdVel);

      setPipes((prev) => {
        const updated = prev
          .map((p) => ({ ...p, x: p.x - (3 + Math.min(score / 10, 3)) }))
          .filter((p) => p.x + pipeWidth > 0);

        if (updated.length === 0 || updated[updated.length - 1].x < gameWidth - 250) {
          const topHeight = Math.random() * 200 + 50;
          const gap = Math.max(baseGap - score * 3, 120);
          updated.push({
            x: gameWidth,
            topHeight,
            gap,
            scored: false,
          });
        }

        return updated;
      });

      setPipes((prev) =>
        prev.map((pipe) => {
          const birdTop = birdY;
          const birdBottom = birdY + birdSize;
          const birdLeft = 100;
          const birdRight = 100 + birdSize;

          const topPipeBottom = pipe.topHeight;
          const bottomPipeTop = pipe.topHeight + pipe.gap;

          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + pipeWidth;

          const hit =
            birdRight > pipeLeft &&
            birdLeft < pipeRight &&
            (birdTop < topPipeBottom || birdBottom > bottomPipeTop);

          if (hit || birdY < 0 || birdY + birdSize > gameHeight) {
            setGameOver(true);
            clearInterval(loopRef.current);
            saveScore(score);
          }

          if (!pipe.scored && pipe.x + pipeWidth < 100) {
            setScore((s) => s + 1);
            return { ...pipe, scored: true };
          }
          return pipe;
        })
      );
    }, 30);

    return () => clearInterval(loopRef.current);
  }, [gameStarted, gameOver, birdVel, pipes, score]);

  return (
    <div
      onClick={jump}
      style={{
        position: "relative",
        width: `${gameWidth}px`,
        height: `${gameHeight}px`,
        border: "2px solid #000",
        overflow: "hidden",
        backgroundColor: gameOver ? "#e57373" : "#87ceeb",
        margin: "40px auto",
        cursor: "pointer",
        transition: "background-color 0.4s ease",
      }}
    >
      <img
        src="https://media.geeksforgeeks.org/wp-content/uploads/20231211115925/flappy_bird_by_jubaaj_d93bpnj.gif"
        alt="bird"
        style={{
          position: "absolute",
          width: birdSize,
          height: birdSize,
          left: 100,
          top: birdY,
          userSelect: "none",
        }}
        draggable={false}
      />

      {pipes.map((pipe, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: "absolute",
              backgroundColor: "#2ecc71",
              width: pipeWidth,
              height: pipe.topHeight,
              left: pipe.x,
              top: 0,
              border: "2px solid #145a32",
            }}
          />
          <div
            style={{
              position: "absolute",
              backgroundColor: "#2ecc71",
              width: pipeWidth,
              height: gameHeight - (pipe.topHeight + pipe.gap),
              left: pipe.x,
              top: pipe.topHeight + pipe.gap,
              border: "2px solid #145a32",
            }}
          />
        </React.Fragment>
      ))}

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
              backgroundColor: "#1976d2",
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
