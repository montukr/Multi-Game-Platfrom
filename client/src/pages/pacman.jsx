import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

import pacmanImg from "../assets/pacman.gif";
import ghost0 from "../assets/ghost0.gif";
import ghost1 from "../assets/ghost1.gif";
import ghost2 from "../assets/ghost2.gif";
import ghost3 from "../assets/ghost3.gif";
import ghostVulnerable from "../assets/ghost_vulnerable.gif";

const SPRITE_PATHS = {
  pac: pacmanImg,
  ghostV: ghostVulnerable,
  ghosts: [ghost0, ghost1, ghost2, ghost3],
};

const DEFAULT_ROWS = 15;
const DEFAULT_COLS = 19;

export default function PacmanSingle({ levelLayout }) {
  const nav = useNavigate();
  const intervalRef = useRef(null);
  const postedScoreRef = useRef(false);
  const engineRef = useRef(null);
  const initialLayoutRef = useRef(null);

  const [state, setState] = useState(() => ({
    rows: DEFAULT_ROWS,
    cols: DEFAULT_COLS,
    level: createDefaultLevel(DEFAULT_ROWS, DEFAULT_COLS),
    pac: { r: 7, c: 9, dir: "left" },
    ghosts: [],
    score: 0,
    gameOver: false,
    frightenedMs: 0,
    tickMs: 140,
  }));

  const [engineReady, setEngineReady] = useState(false);

  // Initialize engine + layout once
  useEffect(() => {
    const eng = createPacmanEngine({
      rows: DEFAULT_ROWS,
      cols: DEFAULT_COLS,
      tickMs: 140,
      frightenMs: 7000,
    });
    engineRef.current = eng;

    const layout = levelLayout || createDefaultLevel(DEFAULT_ROWS, DEFAULT_COLS);
    initialLayoutRef.current = layout.map((row) => [...row]);
    eng.init(initialLayoutRef.current);
    setState(eng.getState());
    setEngineReady(true);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setEngineReady(false);
      engineRef.current = null;
    };
  }, [levelLayout]);

  // FIXED: Tick loop - only depends on engineReady, NOT state.tickMs
  useEffect(() => {
    if (!engineReady || !engineRef.current) return;

    const eng = engineRef.current;

    const runTick = () => {
      if (!engineRef.current) return;
      engineRef.current.update();
      const s = engineRef.current.getState();
      setState(s);

      if (s.gameOver && !postedScoreRef.current) {
        saveScore(s.score);
        postedScoreRef.current = true;
      }
    };

    // Start interval using the engine's tickMs (140ms)
    intervalRef.current = setInterval(runTick, 140);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [engineReady]); // FIXED: Removed state.tickMs dependency

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      const key = (e.key || "").toLowerCase();
      if (["arrowleft", "a"].includes(key)) engineRef.current?.setDirection("left");
      if (["arrowright", "d"].includes(key)) engineRef.current?.setDirection("right");
      if (["arrowup", "w"].includes(key)) engineRef.current?.setDirection("up");
      if (["arrowdown", "s"].includes(key)) engineRef.current?.setDirection("down");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  async function saveScore(finalScore) {
    try {
      await api.post("/api/scores/pacman", { score: finalScore });
    } catch (err) {
      console.warn("Failed to save Pac-Man score", err);
    }
  }

  function restart() {
    if (!engineRef.current || !initialLayoutRef.current) return;
    postedScoreRef.current = false;
    engineRef.current.init(initialLayoutRef.current.map((row) => [...row]));
    setState(engineRef.current.getState());
  }

  function setDir(dir) {
    engineRef.current?.setDirection(dir);
  }

  function renderCell(r, c) {
    const tile = state.level[r][c];
    const isWall = tile === 1;
    const isDot = tile === 0;
    const isPellet = tile === 2;

    if (state.pac && state.pac.r === r && state.pac.c === c) {
      return (
        <img
          src={SPRITE_PATHS.pac}
          alt="pacman"
          style={{
            width: "80%",
            height: "80%",
            transform: dirToRotation(state.pac.dir),
            imageRendering: "pixelated",
          }}
        />
      );
    }

    const ghost = state.ghosts.find(
      (g) => g.r === r && g.c === c && g.respawnTicks === 0
    );
    if (ghost) {
      const sprite = ghost.vulnerable
        ? SPRITE_PATHS.ghostV
        : SPRITE_PATHS.ghosts[ghost.colorIndex % SPRITE_PATHS.ghosts.length];
      return (
        <img
          src={sprite}
          alt="ghost"
          style={{
            width: "80%",
            height: "80%",
            imageRendering: "pixelated",
          }}
        />
      );
    }

    if (isWall) return <div style={styles.wall} />;
    if (isPellet) return <div style={styles.pellet} />;
    if (isDot) return <div style={styles.dot} />;
    return null;
  }

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Pac-Man</h2>
          <span style={styles.badge}>
            {state.gameOver
              ? `Game Over — Score: ${state.score}`
              : `Score: ${state.score}`}
          </span>
        </div>

        <div
          style={{
            ...styles.board,
            gridTemplateColumns: `repeat(${state.cols}, 28px)`,
            gridTemplateRows: `repeat(${state.rows}, 28px)`,
          }}
        >
          {state.level.map((row, r) =>
            row.map((_, c) => (
              <div key={`${r}-${c}`} style={styles.cell}>
                <div style={styles.cellInner}>{renderCell(r, c)}</div>
              </div>
            ))
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.primaryBtn} onClick={restart}>
            Restart
          </button>
          <button style={styles.secondaryBtn} onClick={() => nav("/")}>
            Back to Lobby
          </button>
        </div>

        {!state.gameOver && (
          <div style={styles.touchControls}>
            <div>
              <button onClick={() => setDir("up")} style={styles.touchBtn}>
                ⬆️
              </button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDir("left")} style={styles.touchBtn}>
                ⬅️
              </button>
              <button onClick={() => setDir("down")} style={styles.touchBtn}>
                ⬇️
              </button>
              <button onClick={() => setDir("right")} style={styles.touchBtn}>
                ➡️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Pac-Man Engine ---------- */
function createPacmanEngine(opts = {}) {
  const ROWS = opts.rows || 15;
  const COLS = opts.cols || 19;
  const TICK_MS = opts.tickMs || 140;
  const FRIGHTEN_MS = opts.frightenMs || 7000;
  const PELLET_SCORE = 50;
  const DOT_SCORE = 10;
  const GHOST_BASE_SCORE = 200;
  const RESPAWN_MS = 2000;

  let level = [];
  let score = 0;
  let gameOver = false;
  let pac = { r: 7, c: 9, dir: "left", nextDir: null };
  let ghosts = [];
  let frightenedTicks = 0;
  const respawnTickCount = Math.max(1, Math.round(RESPAWN_MS / TICK_MS));
  const frightenedTickCountDefault = Math.max(1, Math.round(FRIGHTEN_MS / TICK_MS));
  let ghostComboMultiplier = 0;

  const GHOST_STARTS = [
    { r: 7, c: 7 },
    { r: 7, c: 11 },
    { r: 6, c: 9 },
    { r: 8, c: 9 },
  ];

  const cloneLevel = (l) => l.map((r) => [...r]);
  const ensurePellets = (l) => {
    const corners = [
      { r: 1, c: 1 },
      { r: 1, c: COLS - 2 },
      { r: ROWS - 2, c: 1 },
      { r: ROWS - 2, c: COLS - 2 },
    ];
    corners.forEach(({ r, c }) => l[r] && l[r][c] === 0 && (l[r][c] = 2));
  };

  function init(initLevel) {
    level = cloneLevel(initLevel);
    ensurePellets(level);
    score = 0;
    gameOver = false;
    pac = { r: Math.floor(ROWS / 2), c: Math.floor(COLS / 2), dir: "left", nextDir: null };
    ghosts = GHOST_STARTS.map((p, i) => ({
      id: i,
      r: p.r,
      c: p.c,
      dir: i % 2 ? "left" : "right",
      colorIndex: i,
      vulnerable: false,
      respawnTicks: 0,
      home: { r: p.r, c: p.c },
    }));
    frightenedTicks = 0;
    ghostComboMultiplier = 0;
  }

  const inBounds = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
  const walkable = (r, c) => inBounds(r, c) && level[r][c] !== 1;

  const tryChangeDir = (e) => {
    if (!e.nextDir) return e;
    let { r, c } = e;
    if (e.nextDir === "up") r--;
    if (e.nextDir === "down") r++;
    if (e.nextDir === "left") c--;
    if (e.nextDir === "right") c++;
    if (walkable(r, c)) return { ...e, dir: e.nextDir, nextDir: null };
    return e;
  };

  const move = (e) => {
    let { r, c, dir } = e;
    if (dir === "up") r--;
    if (dir === "down") r++;
    if (dir === "left") c--;
    if (dir === "right") c++;
    if (walkable(r, c)) return { ...e, r, c };
    return e;
  };

  const dist = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

  const ghostMove = (g) => {
    if (g.respawnTicks > 0) return g;
    const dirs = ["up", "down", "left", "right"];
    const candidates = dirs
      .map((d) => {
        let [r, c] = [g.r, g.c];
        if (d === "up") r--;
        if (d === "down") r++;
        if (d === "left") c--;
        if (d === "right") c++;
        return walkable(r, c) ? { d, r, c, dist: dist({ r, c }, pac) } : null;
      })
      .filter(Boolean);
    if (!candidates.length) return g;

    candidates.sort((a, b) =>
      g.vulnerable ? b.dist - a.dist : a.dist - b.dist
    );
    const pick = candidates[Math.random() < 0.8 ? 0 : Math.min(1, candidates.length - 1)] || candidates[0];
    return { ...g, dir: pick.d, r: pick.r, c: pick.c };
  };

  const frighten = () => {
    frightenedTicks = frightenedTickCountDefault;
    ghostComboMultiplier = 0;
    ghosts.forEach((g) => (g.vulnerable = true));
  };

  function update() {
    if (gameOver) return;

    pac = tryChangeDir(pac);
    pac = move(pac);

    const tile = level[pac.r][pac.c];
    if (tile === 0) {
      level[pac.r][pac.c] = 9;
      score += DOT_SCORE;
    } else if (tile === 2) {
      level[pac.r][pac.c] = 9;
      score += PELLET_SCORE;
      frighten();
    }

    if (frightenedTicks > 0) {
      frightenedTicks--;
      if (frightenedTicks === 0) ghosts.forEach((g) => (g.vulnerable = false));
    }

    ghosts = ghosts.map((g) => {
      if (g.respawnTicks > 0) {
        g.respawnTicks--;
        if (g.respawnTicks === 0) {
          g.r = g.home.r;
          g.c = g.home.c;
        }
        return g;
      }
      const moved = ghostMove(g);
      moved.vulnerable = frightenedTicks > 0;
      return moved;
    });

    for (const g of ghosts) {
      if (g.respawnTicks > 0) continue;
      if (g.r === pac.r && g.c === pac.c) {
        if (g.vulnerable) {
          ghostComboMultiplier++;
          score += GHOST_BASE_SCORE * ghostComboMultiplier;
          g.respawnTicks = respawnTickCount;
          g.vulnerable = false;
        } else {
          gameOver = true;
        }
      }
    }

    const hasDots = level.some((r) => r.some((c) => c === 0 || c === 2));
    if (!hasDots) gameOver = true;
  }

  function setDirection(dir) {
    if (["up", "down", "left", "right"].includes(dir)) pac.nextDir = dir;
  }

  function getState() {
    return {
      rows: ROWS,
      cols: COLS,
      level: cloneLevel(level),
      pac: { ...pac },
      ghosts: ghosts.map((g) => ({ ...g })),
      score,
      gameOver,
      frightenedMs: frightenedTicks * TICK_MS,
      tickMs: TICK_MS,
    };
  }

  return {
    init,
    update,
    getState,
    setDirection,
  };
}

function createDefaultLevel(rows, cols) {
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) return 1;
      return 0;
    })
  );
  for (let r = 2; r < rows - 2; r += 2)
    for (let c = 2; c < cols - 2; c += 3) grid[r][c] = 1;

  const midR = Math.floor(rows / 2);
  const midC = Math.floor(cols / 2);
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -2; dc <= 2; dc++) grid[midR + dr][midC + dc] = 9;

  const corners = [
    { r: 1, c: 1 },
    { r: 1, c: cols - 2 },
    { r: rows - 2, c: 1 },
    { r: rows - 2, c: cols - 2 },
  ];
  corners.forEach(({ r, c }) => (grid[r][c] = 2));
  return grid;
}

function dirToRotation(dir) {
  return {
    right: "rotate(0deg)",
    left: "rotate(180deg)",
    up: "rotate(-90deg)",
    down: "rotate(90deg)",
  }[dir];
}

const styles = {
  shell: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#f8fafc 0%,#fff7ed 100%)",
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
    background: "#ffedd5",
    color: "#7c2d12",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
  },
  board: {
    display: "grid",
    border: "6px solid #262626",
    borderRadius: 12,
    overflow: "hidden",
  },
  cell: {
    width: 28,
    height: 28,
    background: "#000",
    border: "1px solid rgba(0,0,0,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cellInner: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  wall: { width: "100%", height: "100%", background: "#0b3b3b", borderRadius: 4 },
  dot: { width: 6, height: 6, borderRadius: 999, background: "#ffd54f" },
  pellet: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#fff",
    boxShadow: "0 0 6px rgba(255,255,255,0.6)",
  },
  footer: { display: "flex", justifyContent: "center", gap: 12, marginTop: 8 },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "linear-gradient(135deg,#f97316 0%,#ef4444 100%)",
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
  },
  touchControls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  touchBtn: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
};
