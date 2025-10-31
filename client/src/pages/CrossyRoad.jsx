import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

// constants
const LANE_HEIGHT = 72;
const COLS = 9;
const PLAYER_SIZE = 40;
// CAR speed constants are now *relative*; they'll be scaled by tile size
const CAR_MIN_SPEED = 0.9;
const CAR_MAX_SPEED = 2.8;
const SPAWN_PADDING = 60;

export default function CrossyRoad() {
  const nav = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  const worldRef = useRef({
    tileSize: 0,
    rows: 0,
    offsetY: 0,
    lanes: [],
    player: null,
    speedMultiplier: 1,
  });

  async function saveScore(finalScore) {
    try {
      await api.post("/api/scores/crossy", { score: finalScore });
    } catch (err) {
      console.warn("Failed to save crossy score", err);
    }
  }

  // ---------- INIT ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // tileSize is min of column width and LANE_HEIGHT so lanes stay readable
      worldRef.current.tileSize = Math.floor(
        Math.min(canvas.width / COLS, LANE_HEIGHT)
      );
      worldRef.current.rows =
        Math.ceil(canvas.height / worldRef.current.tileSize) + 2;
    }
    resize();
    window.addEventListener("resize", resize);

    const startCol = Math.floor(COLS / 2);
    worldRef.current.player = {
      row: 1,
      col: startCol,
      x: 0,
      y: 0,
      animProgress: 1,
      from: null,
      to: null,
      size: PLAYER_SIZE,
    };

    // initialize lanes
    worldRef.current.lanes = [];
    for (let i = 0; i < worldRef.current.rows + 10; i++) {
      const type = i % 3 === 0 ? "safe" : "road";
      worldRef.current.lanes.push(createLane(i, type));
    }

    worldRef.current.offsetY = 0;
    worldRef.current.speedMultiplier = 1;
    setScore(0);
    setGameOver(false);
    setPaused(false);

    lastTimeRef.current = performance.now();
    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(loop);

    // touch controls
    let touchStart = null;
    function onTouchStart(e) {
      if (e.touches && e.touches[0]) {
        touchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          t: performance.now(),
        };
      }
    }
    function onTouchEnd(e) {
      if (!touchStart) return;
      const ev = (e.changedTouches && e.changedTouches[0]) || e;
      const dx = ev.clientX - touchStart.x;
      const dy = ev.clientY - touchStart.y;
      const dt = performance.now() - touchStart.t;
      const absX = Math.abs(dx),
        absY = Math.abs(dy);

      if (Math.max(absX, absY) > 30 && dt < 800) {
        if (absX > absY) movePlayer({ dc: dx > 0 ? 1 : -1 });
        else movePlayer({ dr: dy > 0 ? -1 : 1 });
      } else movePlayer({ dr: 1 }); // tap = forward
      touchStart = null;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // keyboard
    function onKey(e) {
      const k = e.key.toLowerCase();
      if (gameOver) {
        if (k === "enter") restart();
        return;
      }
      if (k === "p") {
        setPaused((p) => !p);
        return;
      }
      if (paused) return;

      if (k === "arrowleft" || k === "a") movePlayer({ dc: -1 });
      if (k === "arrowright" || k === "d") movePlayer({ dc: 1 });
      if (k === "arrowup" || k === "w") movePlayer({ dr: 1 });
      if (k === "arrowdown" || k === "s") movePlayer({ dr: -1 });
    }
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- MOVEMENT ----------
  function movePlayer({ dr = 0, dc = 0 }) {
    const w = worldRef.current;
    if (gameOver || paused) return;
    const player = w.player;
    if (player.animProgress < 1) return;

    const newCol = Math.max(0, Math.min(COLS - 1, player.col + dc));
    const newRow = Math.max(0, player.row + dr);

    player.from = { row: player.row, col: player.col };
    player.to = { row: newRow, col: newCol };
    player.animProgress = 0;

    if (dr === 1) {
      setScore((s) => {
        const next = s + 1;
        w.speedMultiplier = 1 + Math.floor(next / 10) * 0.12;
        return next;
      });
    }
  }

  // ---------- LANES ----------
  function createLane(index, type) {
    // make car sizes/positions relative to tileSize so everything scales nicely
    const tile = worldRef.current.tileSize || LANE_HEIGHT;
    const laneWidth = tile * COLS;
    if (type === "safe") return { type, index, items: [] };
    const dir = Math.random() > 0.5 ? 1 : -1; // 1 = left-moving (we'll treat positive as moving left)
    // base speed in px per frame scaled by tile (small screens => smaller px)
    const speedBase =
      (CAR_MIN_SPEED + Math.random() * (CAR_MAX_SPEED - CAR_MIN_SPEED)) *
      (tile / 20);
    const density = 0.45 + Math.random() * 0.5;
    const items = [];
    // start x somewhere from -padding to laneWidth
    let x = -SPAWN_PADDING + Math.random() * Math.max(80, tile * 2);
    while (x < laneWidth + SPAWN_PADDING) {
      if (Math.random() < density) {
        // width relative to tile
        const width = Math.max(24, tile * (0.7 + Math.random() * 1.6));
        items.push({
          x: x + Math.random() * Math.max(40, tile),
          w: width,
          speed: speedBase * (0.9 + Math.random() * 0.8),
          colorSeed: Math.random(),
          dir,
        });
      }
      x += tile * (1.6 + Math.random() * 2.6); // spacing relative to tile
    }
    return { type: "road", index, dir, items, speedBase };
  }

  function ensureLanes() {
    const w = worldRef.current;
    const needed = w.rows + 8;
    while (w.lanes.length < needed) {
      const idx = w.lanes.length;
      const typ = idx % 3 === 0 ? "safe" : "road";
      w.lanes.push(createLane(idx, typ));
    }
  }

  // ---------- GAME LOOP ----------
  function loop(now) {
    const dt = Math.min(40, now - lastTimeRef.current);
    lastTimeRef.current = now;
    const w = worldRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (!paused && !gameOver) updateWorld(dt, w, canvas, ctx);
    drawWorld(ctx, canvas, w);

    if (!gameOver) animationRef.current = requestAnimationFrame(loop);
    else drawGameOver(ctx, canvas, score);
    ensureLanes();
  }

  function updateWorld(dt, w, canvas, ctx) {
    const player = w.player;
    if (player.animProgress < 1) {
      player.animProgress += dt / 140;
      if (player.animProgress >= 1) {
        player.animProgress = 1;
        player.row = player.to.row;
        player.col = player.to.col;
        player.from = player.to = null;

        if (player.row >= 6) {
          const shift = player.row - 1;
          player.row = Math.max(1, player.row - shift);
          w.lanes.splice(0, shift);
          for (let i = 0; i < shift; i++) {
            const newIndex = w.lanes.length;
            const typ = newIndex % 3 === 0 ? "safe" : "road";
            w.lanes.push(createLane(newIndex, typ));
          }
        }
      }
    }

    const tile = w.tileSize;
    const laneWidth = tile * COLS;
    w.lanes.forEach((lane) => {
      if (lane.type !== "road") return;
      lane.items.forEach((car) => {
        // direction: if dir==1 move left (decrease x), else move right
        const dx = car.speed * w.speedMultiplier * (car.dir === 1 ? -1 : 1);
        car.x += dx * (dt / 16);

        // wrap cars so lanes don't empty
        if (car.dir === 1 && car.x + car.w < -SPAWN_PADDING) {
          car.x = laneWidth + SPAWN_PADDING + Math.random() * 60;
        } else if (car.dir !== 1 && car.x > laneWidth + SPAWN_PADDING) {
          car.x = -SPAWN_PADDING - car.w - Math.random() * 60;
        }
      });
    });

    const playerPixelX = (player.col + 0.5) * tile;
    const playerLaneIndex = player.row;
    const lane = w.lanes[playerLaneIndex];
    if (lane && lane.type === "road") {
      // check collisions using player's center x and normalized lane car positions
      for (const car of lane.items) {
        const carLeft = car.x;
        const carRight = car.x + car.w;
        // small vertical margin handled by lane check: if player's x intersects car bounds -> hit
        if (playerPixelX > carLeft - 8 && playerPixelX < carRight + 8) {
          setGameOver(true);
          saveScore(score);
          break;
        }
      }
    }
  }

  // ---------- DRAWING ----------
  function drawWorld(ctx, canvas, w) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tile = w.tileSize;
    const rows = w.lanes.length;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#cfeeff");
    grad.addColorStop(1, "#9fd7f2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let li = 0; li < Math.min(rows, Math.ceil(canvas.height / tile) + 6); li++) {
      const lane = w.lanes[li];
      const y = canvas.height - (li + 1) * tile;
      if (lane.type === "safe") {
        ctx.fillStyle = "#9de29a";
        roundRectFill(ctx, 12, y + 6, canvas.width - 24, tile - 12, 8);
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        for (let s = 0; s < 4; s++) {
          ctx.fillRect(40 + (s * 180) % (canvas.width - 80), y + 12, 20, tile - 24);
        }
      } else {
        ctx.fillStyle = "#3a3d42";
        roundRectFill(ctx, 8, y + 6, canvas.width - 16, tile - 12, 6);
        ctx.fillStyle = "#ffd";
        const dashW = Math.max(12, tile / 2);
        for (let x = (Math.floor(li * 23) % 60); x < canvas.width; x += Math.max(96, tile * 3)) {
          ctx.fillRect(x, y + tile / 2 - 3, dashW, 6);
        }

        lane.items.forEach((car) => {
          const carH = Math.max(18, tile - 22);
          const cx = car.x;
          const cy = y + 12;
          const cg = ctx.createLinearGradient(cx, cy, cx + car.w, cy);
          if (car.colorSeed < 0.33) {
            cg.addColorStop(0, "#ff6b6b");
            cg.addColorStop(1, "#e55b5b");
          } else if (car.colorSeed < 0.66) {
            cg.addColorStop(0, "#6b9cff");
            cg.addColorStop(1, "#4b86f2");
          } else {
            cg.addColorStop(0, "#ffd36b");
            cg.addColorStop(1, "#ffbe3b");
          }
          ctx.fillStyle = cg;
          roundRectFill(ctx, cx, cy, car.w, carH, 8);
          // window
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillRect(cx + 8, cy + 6, Math.max(12, car.w - 24), carH - 12);
        });
      }
    }

    const p = w.player;
    const tileCenterX = (p.col + 0.5) * tile;
    const tileCenterY = canvas.height - (p.row + 0.5) * tile;
    let drawX = tileCenterX,
      drawY = tileCenterY;
    if (p.animProgress < 1 && p.from && p.to) {
      const fromX = (p.from.col + 0.5) * tile;
      const fromY = canvas.height - (p.from.row + 0.5) * tile;
      const toX = (p.to.col + 0.5) * tile;
      const toY = canvas.height - (p.to.row + 0.5) * tile;
      const t = easeOutCubic(p.animProgress);
      drawX = fromX + (toX - fromX) * t;
      drawY = fromY + (toY - fromY) * t;
    }

    // chicken
    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#fff3c4";
    roundRectFill(ctx, -22, -18, 44, 36, 12);
    ctx.fillStyle = "#ffd36b";
    roundRectFill(ctx, -6, -6, 18, 14, 8);
    ctx.fillStyle = "#ffb84d";
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(34, -6);
    ctx.lineTo(34, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(8, -6, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // HUD & back button drawn by canvas still (keeps behavior consistent with click bounds)
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.font = "600 18px Inter, Arial";
    ctx.fillText(`Score: ${score}`, 18, 30);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    roundRectFill(ctx, canvas.width - 120, 10, 110, 36, 10);
    ctx.fillStyle = "#fff";
    ctx.font = "600 16px Inter, Arial";
    ctx.fillText("Back", canvas.width - 82, 34);
  }

  function drawGameOver(ctx, canvas, finalScore) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px Inter, Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "24px Inter, Arial";
    ctx.fillText(`Score: ${finalScore}`, canvas.width / 2, canvas.height / 2);
    ctx.font = "18px Inter, Arial";
    ctx.fillText("Press Enter to Restart or Back to Lobby", canvas.width / 2, canvas.height / 2 + 40);
    ctx.restore();
  }

  function restart() {
    const w = worldRef.current;
    w.lanes = [];
    for (let i = 0; i < w.rows + 10; i++) {
      const typ = i % 3 === 0 ? "safe" : "road";
      w.lanes.push(createLane(i, typ));
    }
    w.player.row = 1;
    w.player.col = Math.floor(COLS / 2);
    w.player.animProgress = 1;
    w.player.from = null;
    w.player.to = null;
    w.offsetY = 0;
    w.speedMultiplier = 1;
    setScore(0);
    setGameOver(false);
    setPaused(false);
    cancelAnimationFrame(animationRef.current);
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(loop);
  }

  function roundRectFill(ctx, x, y, w, h, r) {
    ctx.beginPath();
    const rr = r || 6;
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.fill();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  useEffect(() => {
    ensureLanes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // click handler on canvas for back button (and tap)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // back button area top-right
      if (x > canvas.width - 120 && x < canvas.width - 10 && y > 10 && y < 46) {
        nav("/");
      } else {
        // tap = hop forward
        movePlayer({ dc: 0, dr: 1 });
      }
    }
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [nav]);

  // ---------------- UI helpers ----------------
  function ControlButton({ children, onClick, active }) {
    return (
      <button
        onClick={onClick}
        className={`w-14 h-14 rounded-xl font-bold text-lg shadow-md flex items-center justify-center select-none
          transition-transform transform active:scale-95 focus:outline-none
          ${active ? "bg-amber-400 text-black" : "bg-white/90 text-black"}`}
        aria-pressed={!!active}
      >
        {children}
      </button>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="relative w-screen h-screen overflow-hidden font-inter">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />

      {/* Score (separate DOM overlay so text is crisp) */}
      <div className="absolute top-4 left-6 text-white font-bold text-xl drop-shadow-md pointer-events-none">
        Score: {score}
      </div>

      {/* Left controls */}
      <div className="absolute bottom-6 left-6 flex gap-3 z-50">
        <ControlButton onClick={() => movePlayer({ dc: -1 })}>◀</ControlButton>
        <ControlButton onClick={() => movePlayer({ dr: 1 })}>▲</ControlButton>
        <ControlButton onClick={() => movePlayer({ dc: 1 })}>▶</ControlButton>
        <ControlButton onClick={() => movePlayer({ dr: -1 })}>▼</ControlButton>
      </div>

      {/* Pause / Resume */}
      <div className="absolute bottom-6 right-6 z-50">
        <ControlButton onClick={() => setPaused((p) => !p)} active={paused}>
          {paused ? "▶" : "II"}
        </ControlButton>
      </div>

      {/* Overlay when paused or game over (DOM overlay for clarity + buttons) */}
      {(paused || gameOver) && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 text-center max-w-sm mx-4">
            <h2 className="text-white text-3xl font-bold mb-2">
              {gameOver ? "Game Over" : "Paused"}
            </h2>
            <p className="text-white/90 mb-4">{gameOver ? `Score: ${score}` : "Take a breather"}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  if (gameOver) restart();
                  else setPaused(false);
                }}
                className="px-4 py-2 rounded-md bg-white/90 font-semibold"
              >
                {gameOver ? "Restart" : "Resume"}
              </button>
              <button
                onClick={() => nav("/")}
                className="px-4 py-2 rounded-md bg-white/50 font-semibold"
              >
                Back to Lobby
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
