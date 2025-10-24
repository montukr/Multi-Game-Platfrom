import express from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

const regSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(20).required(),
  password: Joi.string().min(4).required(), // min 4
});

router.post("/register", async (req, res) => {
  const { error, value } = regSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const exists = await User.findOne({ $or: [{ email: value.email }, { username: value.username }] });
  if (exists) return res.status(400).json({ message: "Email or username already used" });
  const hash = await bcrypt.hash(value.password, 10);
  const user = await User.create({ email: value.email, username: value.username, password: hash });
  res.status(201).json({ id: user._id, email: user.email, username: user.username });
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // username or email
  const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ id: user._id, email: user.email, username: user.username });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
