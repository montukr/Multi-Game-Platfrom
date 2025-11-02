// import http from "http";
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import { Server } from "socket.io";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/auth.js";
// import profileRoutes from "./routes/profile.js";
// import registerSockets from "./sockets/index.js";
// import snakeRoutes from "./routes/snake.js";

// dotenv.config();
// const app = express();

// app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
// app.use(express.json());
// app.use(cookieParser());

// connectDB();

// app.use("/api/auth", authRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/snake", snakeRoutes);

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: process.env.CORS_ORIGIN, credentials: true },
// });

// registerSockets(io, app);

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server on ${PORT}`));

import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import snakeRoutes from "./routes/snake.js";
import scoresRoutes from "./routes/scores.js";
import registerSockets from "./sockets/index.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/snake", snakeRoutes);
app.use("/api/scores", scoresRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
});

registerSockets(io, app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
