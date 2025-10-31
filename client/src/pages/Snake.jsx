import { useEffect, useRef, useState } from "react";

export default function Snake() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [starter, setStarter] = useState(() => localStorage.getItem("snake_starter") || "p1");
  const scoreRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 20, cols = Math.floor(canvas.width / size), rows = Math.floor(canvas.height / size);

    let snake = [{ x: 5, y: 5 }];
    let dir = starter === "p1" ? { x: 1, y: 0 } : { x: 0, y: 1 };
    let nextDir = { ...dir };
    let food = randFood();
    let last = 0, stepMs = 110, acc = 0, running = true;
    let best = 0;

    function randFood() {
      let f;
      do { f = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; }
      while (snake.some(s => s.x === f.x && s.y === f.y));
      return f;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = performance.now() / 500;
      const pulse = 0.3 + 0.2 * Math.sin(t);
      ctx.fillStyle = `rgba(239,68,68,${0.8 + pulse})`;
      roundRect(ctx, food.x * size, food.y * size, size - 1, size - 1, 4);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 8;
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#22c55e" : "rgba(34,197,94,0.85)";
        roundRect(ctx, seg.x * size, seg.y * size, size - 1, size - 1, 4);
        ctx.fill();
      });
      ctx.restore();
    }

    function gameOver() {
      running = false;
      best = Math.max(best, scoreRef.current);
      fetch(import.meta.env.VITE_API_URL + "/api/snake/best", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: best }),
      }).catch(()=>{});

      const nextStarter = starter === "p1" ? "p2" : "p1";
      localStorage.setItem("snake_starter", nextStarter);
      setStarter(nextStarter);

      setTimeout(() => {
        reset(nextStarter);
      }, 600);
    }

    function reset(nextStarter) {
      snake = [{ x: 5, y: 5 }];
      dir = nextStarter === "p1" ? { x: 1, y: 0 } : { x: 0, y: 1 };
      nextDir = { ...dir };
      food = randFood();
      last = 0; acc = 0; running = true;
      setScore(0); scoreRef.current = 0;
      requestAnimationFrame(loop);
    }

    function tick() {
      dir = nextDir;
      const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
      if (snake.some((s, i) => i !== 0 && s.x === head.x && s.y === head.y)) { gameOver(); return; }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => { scoreRef.current = s + 1; return s + 1; });
        food = randFood();
      } else {
        snake.pop();
      }
    }

    function loop(ts) {
      if (!running) return;
      const dt = ts - last; last = ts; acc += dt;
      while (acc >= stepMs) { tick(); acc -= stepMs; }
      draw(); requestAnimationFrame(loop);
    }

    const mm = (e) => { const p = toCanvasCoords(canvas, e); setToward(p.x, p.y); };
    const tm = (e) => { const p = toCanvasCoords(canvas, e); setToward(p.x, p.y); e.preventDefault(); };
    canvas.addEventListener("mousemove", mm);
    canvas.addEventListener("touchmove", tm, { passive: false });
    window.addEventListener("keydown", keyDown);

    requestAnimationFrame(loop);
    return () => {
      canvas.removeEventListener("mousemove", mm);
      canvas.removeEventListener("touchmove", tm);
      window.removeEventListener("keydown", keyDown);
    };

    function keyDown(e) {
      const key = e.key.toLowerCase();
      if ((key === "arrowup" || key === "w") && dir.y !== 1)
        nextDir = { x: 0, y: -1 };
      else if ((key === "arrowdown" || key === "s") && dir.y !== -1)
        nextDir = { x: 0, y: 1 };
      else if ((key === "arrowleft" || key === "a") && dir.x !== 1)
        nextDir = { x: -1, y: 0 };
      else if ((key === "arrowright" || key === "d") && dir.x !== -1)
        nextDir = { x: 1, y: 0 };
    }

    function toCanvasCoords(canvas, e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
      const y = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
      return { x: x - rect.left, y: y - rect.top };
    }

    function setToward(x, y) {
      const head = { x: snake[0].x * size + size / 2, y: snake[0].y * size + size / 2 };
      const dx = x - head.x, dy = y - head.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir.x !== -1) nextDir = { x: 1, y: 0 };
        if (dx < 0 && dir.x !== 1) nextDir = { x: -1, y: 0 };
      } else {
        if (dy > 0 && dir.y !== -1) nextDir = { x: 0, y: 1 };
        if (dy < 0 && dir.y !== 1) nextDir = { x: 0, y: -1 };
      }
    }
  }, [starter]);

  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <h2>Snake</h2>
      <p>Score: {score} • Starter: {starter === "p1" ? "Player A" : "Player B"}</p>
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          touchAction: "none",
          background: "#0b1220"
        }}
      />

      {/* On-screen mobile controls */}
      <div
        style={{
          display: "grid",
          gridTemplateAreas: `"up up up" "left center right" "down down down"`,
          gap: 8,
          width: 160,
          margin: "16px auto"
        }}
      >
        {[
          { name: "↑", area: "up", dir: { x: 0, y: -1 } },
          { name: "↓", area: "down", dir: { x: 0, y: 1 } },
          { name: "←", area: "left", dir: { x: -1, y: 0 } },
          { name: "→", area: "right", dir: { x: 1, y: 0 } },
        ].map((btn) => (
          <button
            key={btn.name}
            style={{
              gridArea: btn.area,
              padding: 16,
              fontSize: 20,
              borderRadius: 10,
              background: "#1e293b",
              color: "#f1f5f9",
              border: "none",
              touchAction: "none"
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              if (Math.abs(btn.dir.x) !== Math.abs(0) ||
                  Math.abs(btn.dir.y) !== Math.abs(0))
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: btn.name === "↑" ? "ArrowUp" :
                                                          btn.name === "↓" ? "ArrowDown" :
                                                          btn.name === "←" ? "ArrowLeft" : "ArrowRight" })
                );
            }}
          >
            {btn.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
