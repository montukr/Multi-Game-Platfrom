import mongoose from "mongoose";

// --- Snake schema (tracks high score) ---
const snakeSchema = new mongoose.Schema({
  highestScore: { type: Number, default: 0 },
}, { _id: false });

// --- Tetris schema (same structure as snake) ---
const tetrisSchema = new mongoose.Schema({
  highestScore: { type: Number, default: 0 },
}, { _id: false });

// --- Generic game totals (used by TicTacToe, Chess, etc.) ---
const gameTotalsSchema = new mongoose.Schema({
  wins: { type: Number, default: 0 },
  gamesJoined: { type: Number, default: 0 },
}, { _id: false });

// ---Flappyt Bird (score) ---
const flappySchema = new mongoose.Schema({
  highestScore: { type: Number, default: 0 },
}, { _id: false });

// --- Crossy Road (score) ---
const crossySchema = new mongoose.Schema({
  highestScore: { type: Number, default: 0 },
}, { _id: false });



// --- Main user progress schema ---
const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true,
    required: true,
  },
  username: { type: String, index: true },
  totals: {
    ttt:    { type: gameTotalsSchema, default: () => ({}) },
    chess:  { type: gameTotalsSchema, default: () => ({}) },
    snake:  { type: snakeSchema,      default: () => ({}) },
    tetris: { type: tetrisSchema,     default: () => ({}) }, // ✅ Added Tetris
    flappy: { type: flappySchema,     default: () => ({}) },
    crossy: { type: crossySchema,     default: () => ({}) },
  },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: "user_progress",
});

// Ensure consistent indexing
userProgressSchema.index({ userId: 1 });

export default mongoose.model("UserProgress", userProgressSchema);
