import express from "express";
import requireAuth from "../middleware/auth.js";
import UserProgress from "../models/UserProgress.js";

const router = express.Router();

router.post("/best", requireAuth, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== "number" || score < 0) {
    return res.status(400).json({ message: "Invalid score" });
  }
  const doc = await UserProgress.findOne({ userId: req.userId });
  const current = doc?.totals?.snake?.highestScore || 0;
  const newHigh = score > current ? score : current;

  await UserProgress.findOneAndUpdate(
    { userId: req.userId },
    { $set: { "totals.snake.highestScore": newHigh, updatedAt: new Date() } },
    { upsert: true }
  );

  return res.json({ ok: true, highestScore: newHigh });
});

export default router;
