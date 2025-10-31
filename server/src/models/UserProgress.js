import mongoose from "mongoose";

const snakeSchema = new mongoose.Schema({
  highestScore: { type: Number, default: 0 },
}, { _id: false });

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
  },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: "user_progress",
});

userProgressSchema.index({ userId: 1 });

export default mongoose.model("UserProgress", userProgressSchema);
