import { createState, applyMove } from "../games/chess/engine.js";

export const chessRooms = new Map(); // roomId -> { state, players:[{socketId,username,color}] }

export default function chess(socket, io) {
  socket.on("joinRoom", ({ roomId, username }) => {
    if (!roomId || !String(roomId).trim()) return socket.emit("errorMsg", "Room ID required");
    if (!chessRooms.has(roomId)) chessRooms.set(roomId, { state: createState(), players: [] });
    const room = chessRooms.get(roomId);
    if (!room.players.find(p => p.socketId === socket.id)) {
      if (room.players.length < 2) {
        const color = room.players.length === 0 ? "w" : "b";
        room.players.push({ socketId: socket.id, username, color });
      }
      socket.join(roomId);
    }
    io.to(roomId).emit("roomUpdate", view(room));
    io.to(roomId).emit("gameState", { turn: room.state.turn, matrix: room.state.matrix });
  });

  socket.on("move", ({ roomId, from, to }) => {
    const room = chessRooms.get(roomId);
    if (!room) return;
    const me = room.players.find(p => p.socketId === socket.id);
    if (!me || room.state.turn !== me.color) return;
    room.state = applyMove(room.state, from, to);
    io.to(roomId).emit("gameState", { turn: room.state.turn, matrix: room.state.matrix });
  });

  socket.on("restart", ({ roomId }) => {
    const room = chessRooms.get(roomId);
    if (!room) return;
    room.state = createState();
    io.to(roomId).emit("gameState", { turn: room.state.turn, matrix: room.state.matrix });
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      const room = chessRooms.get(roomId);
      if (!room) continue;
      room.players = room.players.filter(p => p.socketId !== socket.id);
      io.to(roomId).emit("roomUpdate", view(room));
      if (room.players.length === 0) chessRooms.delete(roomId);
    }
  });
}
function view(room){ return { players: room.players.map(p=>({username:p.username,color:p.color})) }; }
