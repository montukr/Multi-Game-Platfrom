// import mongoose from "mongoose";

// // --- Snake schema (tracks high score) ---
// const snakeSchema = new mongoose.Schema({
//   highestScore: { type: Number, default: 0 },
// }, { _id: false });

// // --- Tetris schema (same structure as snake) ---
// const tetrisSchema = new mongoose.Schema({
//   highestScore: { type: Number, default: 0 },
// }, { _id: false });

// // --- Flappy Bird schema ---
// const flappySchema = new mongoose.Schema({
//   highestScore: { type: Number, default: 0 },
// }, { _id: false });

// // --- Pac-Man schema ---
// const pacmanSchema = new mongoose.Schema({
//   highestScore: { type: Number, default: 0 },
// }, { _id: false });

// // --- Generic game totals (used by TicTacToe, Chess, etc.) ---
// const gameTotalsSchema = new mongoose.Schema({
//   wins: { type: Number, default: 0 },
//   gamesJoined: { type: Number, default: 0 },
// }, { _id: false });

// // --- Main user progress schema ---
// const userProgressSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     unique: true,
//     index: true,
//     required: true,
//   },
//   username: { type: String, index: true },
//   totals: {
//     ttt:    { type: gameTotalsSchema, default: () => ({}) },
//     chess:  { type: gameTotalsSchema, default: () => ({}) },
//     snake:  { type: snakeSchema,      default: () => ({}) },
//     tetris: { type: tetrisSchema,     default: () => ({}) },
//     flappy: { type: flappySchema,     default: () => ({}) },
//     pacman: { type: pacmanSchema,     default: () => ({}) }, // ✅ Added Pac-Man
//   },
//   updatedAt: { type: Date, default: Date.now },
// }, {
//   timestamps: true,
//   collection: "user_progress",
// });

// // Ensure consistent indexing
// userProgressSchema.index({ userId: 1 });

// export default mongoose.model("UserProgress", userProgressSchema);

import mongoose from "mongoose";

// Arcade high score schemas
const snakeSchema = new mongoose.Schema({ highestScore: { type: Number, default: 0 } }, { _id: false });
const tetrisSchema = new mongoose.Schema({ highestScore: { type: Number, default: 0 } }, { _id: false });
const flappySchema = new mongoose.Schema({ highestScore: { type: Number, default: 0 } }, { _id: false });
const pacmanSchema = new mongoose.Schema({ highestScore: { type: Number, default: 0 } }, { _id: false });

// Turn-based totals (wins + gamesJoined)
const gameTotalsSchema = new mongoose.Schema({
  wins: { type: Number, default: 0 },
  gamesJoined: { type: Number, default: 0 },
}, { _id: false });

const userProgressSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, index: true, required: true },
  username: { type: String, index: true },
  totals: {
    ttt:   { type: gameTotalsSchema, default: () => ({}) },
    chess: { type: gameTotalsSchema, default: () => ({}) },
    snake: { type: snakeSchema,     default: () => ({}) },
    tetris:{ type: tetrisSchema,    default: () => ({}) },
    flappy:{ type: flappySchema,    default: () => ({}) },
    pacman:{ type: pacmanSchema,    default: () => ({}) },
  },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: "user_progress",
});

userProgressSchema.index({ userId: 1 });

export default mongoose.model("UserProgress", userProgressSchema);
