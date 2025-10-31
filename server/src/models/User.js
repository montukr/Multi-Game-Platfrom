import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, index: true },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  gamesJoined: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
