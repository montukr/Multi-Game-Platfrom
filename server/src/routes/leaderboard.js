import express from "express";
import requireAuth from "../middleware/auth.js";
import UserProgress from "../models/UserProgress.js";

const router = express.Router();

// GET /api/leaderboard?limit=10
router.get("/", requireAuth, async (req, res) => {
  const limit = Math.max(1, Math.min(parseInt(req.query.limit || "10", 10), 100));

  const [ttt, chess, snake, tetris, flappy, pacman] = await Promise.all([
    UserProgress.find({}, { userId:1, username:1, "totals.ttt.wins":1 })
      .sort({ "totals.ttt.wins": -1, updatedAt: -1 }).limit(limit).lean(),
    UserProgress.find({}, { userId:1, username:1, "totals.chess.wins":1 })
      .sort({ "totals.chess.wins": -1, updatedAt: -1 }).limit(limit).lean(),
    UserProgress.find({}, { userId:1, username:1, "totals.snake.highestScore":1 })
      .sort({ "totals.snake.highestScore": -1, updatedAt: -1 }).limit(limit).lean(),
    UserProgress.find({}, { userId:1, username:1, "totals.tetris.highestScore":1 })
      .sort({ "totals.tetris.highestScore": -1, updatedAt: -1 }).limit(limit).lean(),
    UserProgress.find({}, { userId:1, username:1, "totals.flappy.highestScore":1 })
      .sort({ "totals.flappy.highestScore": -1, updatedAt: -1 }).limit(limit).lean(),
    UserProgress.find({}, { userId:1, username:1, "totals.pacman.highestScore":1 })
      .sort({ "totals.pacman.highestScore": -1, updatedAt: -1 }).limit(limit).lean(),
  ]);

  res.json({
    ttt: ttt.map(x => ({ userId: x.userId, username: x.username, wins: x?.totals?.ttt?.wins || 0 })),
    chess: chess.map(x => ({ userId: x.userId, username: x.username, wins: x?.totals?.chess?.wins || 0 })),
    snake: snake.map(x => ({ userId: x.userId, username: x.username, highest: x?.totals?.snake?.highestScore || 0 })),
    tetris: tetris.map(x => ({ userId: x.userId, username: x.username, highest: x?.totals?.tetris?.highestScore || 0 })),
    flappy: flappy.map(x => ({ userId: x.userId, username: x.username, highest: x?.totals?.flappy?.highestScore || 0 })),
    pacman: pacman.map(x => ({ userId: x.userId, username: x.username, highest: x?.totals?.pacman?.highestScore || 0 })),
  });
});

export default router;
