import tttHandler, { tttRooms } from "./tictactoe.js";
import chessHandler, { chessRooms } from "./chess.js";
import roomsRouter from "../routes/rooms.js";

export default function registerSockets(io, app) {
  const ttto = io.of("/tictactoe");
  const chesso = io.of("/chess");

  ttto.on("connection", (socket) => tttHandler(socket, ttto));
  chesso.on("connection", (socket) => chessHandler(socket, chesso));

  // REST endpoints to list rooms
  app.use("/api/rooms", roomsRouter({ tttRooms, chessRooms }));
}
