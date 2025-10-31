import express from "express";
import requireAuth from "../middleware/auth.js";
import Room from "../models/Room.js";
import { randomId } from "../utils/id.js";

const router = express.Router();

// Create a room with a human-readable name; returns a unique roomId
router.post("/create", requireAuth, async (req, res) => {
  const { roomName, game } = req.body;
  if (!roomName || !game) return res.status(400).json({ message: "roomName and game required" });

  let roomId;
  do { roomId = randomId(); } while (await Room.findOne({ roomId }));

  const doc = await Room.create({
    roomId,
    roomName,
    game,
    players: [],
    state: {},
    turn: null,
    winner: null,
    started: false,
  });

  return res.status(201).json({ roomId: doc.roomId, roomName: doc.roomName, game: doc.game });
});

export default router;
