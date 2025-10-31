import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  symbol:   String,  // ttt X/O
  color:    String,  // chess w/b
  wins:     { type: Number, default: 0 },
  score:    { type: Number, default: 0 },
}, { _id: false });

const historySchema = new mongoose.Schema({
  winner:  String, // "X"|"O"|"w"|"b"|"draw"
  endedAt: Date,
  moves:   [{}],
}, { _id: false });

const roomSchema = new mongoose.Schema({
  roomId:   { type: String, required: true, index: true },
  roomName: { type: String, default: "" },
  game:     { type: String, enum: ["ttt","chess","snake"], required: true, index: true },
  players:  [playerSchema],
  state:    {},
  turn:     String, // chess: "w"|"b"
  winner:   String,
  started:  { type: Boolean, default: false },
  starter:  { type: String, default: "" }, // chess uses "w"|"b"
  history:  [historySchema],
  updatedAt:{ type: Date, default: Date.now },
}, { timestamps: true });

roomSchema.index({ roomId: 1, game: 1, updatedAt: -1 });

export default mongoose.model("Room", roomSchema);
