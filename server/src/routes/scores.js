import express from "express";
import requireAuth from "../middleware/auth.js";
import UserProgress from "../models/UserProgress.js";

const router = express.Router();

async function upsertHigh(userId, path, value) {
  await UserProgress.findOneAndUpdate(
    { userId },
    { $max: { [path]: value }, $set: { updatedAt: new Date() } },
    { upsert: true }
  );
}

router.post("/tetris/best", requireAuth, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number" || score < 0) return res.status(400).json({ message: "Invalid score" });
  await upsertHigh(req.userId, "totals.tetris.highestScore", score);
  res.json({ ok: true, highestScore: score });
});

router.post("/flappy/best", requireAuth, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number" || score < 0) return res.status(400).json({ message: "Invalid score" });
  await upsertHigh(req.userId, "totals.flappy.highestScore", score);
  res.json({ ok: true, highestScore: score });
});

router.post("/pacman/best", requireAuth, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number" || score < 0) return res.status(400).json({ message: "Invalid score" });
  await upsertHigh(req.userId, "totals.pacman.highestScore", score);
  res.json({ ok: true, highestScore: score });
});

export default router;
