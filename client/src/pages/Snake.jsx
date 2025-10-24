import { useEffect, useRef, useState } from "react";

export default function Snake() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 20, cols = Math.floor(canvas.width / size), rows = Math.floor(canvas.height / size);

    let snake = [{ x: 5, y: 5 }];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = randFood();
    let last = 0, stepMs = 110, acc = 0, running = true;

    function randFood() {
      let f;
      do { f = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; }
      while (snake.some(s => s.x === f.x && s.y === f.y));
      return f;
    }
    function toCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
      const y = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
      return { x: x - rect.left, y: y - rect.top };
    }
    function setDirToward(x, y) {
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

    const mm = (e) => { const p = toCanvasCoords(e); setDirToward(p.x, p.y); };
    const tm = (e) => { const p = toCanvasCoords(e); setDirToward(p.x, p.y); e.preventDefault(); };
    canvas.addEventListener("mousemove", mm);
    canvas.addEventListener("touchmove", tm, { passive: false });

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && dir.y !== 1) nextDir = { x: 0, y: -1 };
      else if (e.key === "ArrowDown" && dir.y !== -1) nextDir = { x: 0, y: 1 };
      else if (e.key === "ArrowLeft" && dir.x !== 1) nextDir = { x: -1, y: 0 };
      else if (e.key === "ArrowRight" && dir.x !== -1) nextDir = { x: 1, y: 0 };
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ef4444"; ctx.fillRect(food.x * size, food.y * size, size - 1, size - 1);
      snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
        ctx.fillRect(seg.x * size, seg.y * size, size - 1, size - 1);
      });
    }
    function tick() {
      dir = nextDir;
      const head = { x: (snake[0].x + dir.x + cols) % cols, y: (snake[0].y + dir.y + rows) % rows };
      if (snake.some((s, i) => i !== 0 && s.x === head.x && s.y === head.y)) { running = false; return; }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) { setScore(s => s + 1); food = randFood(); } else { snake.pop(); }
    }
    function loop(ts) {
      if (!running) return;
      const dt = ts - last; last = ts; acc += dt;
      while (acc >= stepMs) { tick(); acc -= stepMs; }
      draw(); requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    return () => {
      running = false;
      canvas.removeEventListener("mousemove", mm);
      canvas.removeEventListener("touchmove", tm);
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Snake</h2>
      <p>Score: {score}</p>
      <canvas ref={canvasRef} width={480} height={360} style={{ border: "1px solid #e5e7eb", borderRadius: 10, touchAction: "none" }} />
    </div>
  );
}
