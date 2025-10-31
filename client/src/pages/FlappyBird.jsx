import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// A cleaner, more polished Flappy Bird implementation
export default function FlappyBird() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const bird = useRef({ x: 180, y: 250, radius: 20, velocity: 0, gravity: 0.45, lift: -7.5 });
  const pipes = useRef([]);
  const groundOffset = useRef(0);
  const raf = useRef(null);

  const resetGame = () => {
    bird.current.y = 250;
    bird.current.velocity = 0;
    pipes.current = [];
    groundOffset.current = 0;
    setScore(0);
    setIsGameOver(false);
    setIsStarted(false);
  };

  const flap = () => {
    if (isGameOver) return;
    if (!isStarted) setIsStarted(true);
    bird.current.velocity = bird.current.lift;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") flap();
      if (e.code === "Enter" && isGameOver) resetGame();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isGameOver, isStarted]);

  const update = (ctx, canvas) => {
    const b = bird.current;

    // Draw background
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#75c9ff");
    sky.addColorStop(1, "#1c7ed6");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isStarted && !isGameOver) {
      b.velocity += b.gravity;
      b.y += b.velocity;

      const pipeGap = 170;
      const pipeWidth = 90;
      const spacing = 320;

      if (!pipes.current.length || pipes.current[pipes.current.length - 1].x < canvas.width - spacing) {
        const topHeight = Math.random() * (canvas.height * 0.45);
        pipes.current.push({ x: canvas.width, top: topHeight, bottom: topHeight + pipeGap, width: pipeWidth, scored: false });
      }

      pipes.current.forEach((p) => {
        p.x -= 3.2;

        const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
        pipeGrad.addColorStop(0, "#2ecc71");
        pipeGrad.addColorStop(1, "#27ae60");
        ctx.fillStyle = pipeGrad;

        ctx.fillRect(p.x, 0, p.width, p.top);
        ctx.fillRect(p.x, p.bottom, p.width, canvas.height - p.bottom);

        // collision
        if (
          b.x + b.radius > p.x &&
          b.x - b.radius < p.x + p.width &&
          (b.y - b.radius < p.top || b.y + b.radius > p.bottom)
        ) {
          setIsGameOver(true);
          return;
        }

        // scoring
        if (!p.scored && p.x + p.width < b.x - b.radius) {
          setScore((s) => s + 1);
          p.scored = true;
        }
      });

      pipes.current = pipes.current.filter((p) => p.x + p.width > 0);

      groundOffset.current = (groundOffset.current - 3.2) % 40;
    }

    // Ground
    const groundH = 80;
    ctx.fillStyle = "#c8b68a";
    ctx.fillRect(0, canvas.height - groundH, canvas.width, groundH);
    ctx.fillStyle = "#aa9978";
    for (let x = groundOffset.current; x < canvas.width; x += 40) {
      ctx.fillRect(x, canvas.height - groundH, 20, 12);
    }

    // Bird
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = "#ffdf3e";
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (b.y + b.radius >= canvas.height - groundH || b.y - b.radius <= 0) {
      setIsGameOver(true);
      return;
    }

    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px Arial";
    ctx.fillText(`Score: ${score}`, 20, 50);

    if (!isGameOver) raf.current = requestAnimationFrame(() => update(ctx, canvas));

    if (!isStarted) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.font = "28px Arial";
      ctx.fillText("Tap or Press Space to Start", canvas.width / 2 - 200, canvas.height / 2);
    }

    if (isGameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.font = "38px Arial";
      ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2 - 20);
      ctx.font = "22px Arial";
      ctx.fillText("Press Enter to Restart", canvas.width / 2 - 130, canvas.height / 2 + 20);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => update(ctx, canvas));

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [isGameOver, isStarted, score]);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-b from-sky-300 to-sky-600 select-none">
      <canvas ref={canvasRef} onClick={flap} className="w-full h-full" />

      {!isStarted && !isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute text-2xl font-bold bg-white/40 p-4 rounded-xl backdrop-blur-md shadow-xl"
        >
          Click or press Space to begin
        </motion.div>
      )}
    </div>
  );
}
