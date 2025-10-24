import express from "express";
import requireAuth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("_id email username");
  res.json({ id: user._id, email: user.email, username: user.username });
});

export default router;
