import { createState } from "../games/tictactoe/engine.js";

export const tttRooms = new Map(); // roomId -> { state, players, turn, started }

export default function tictactoe(socket, io) {
  socket.on("joinRoom", ({ roomId, userId, username }) => {
    if (!roomId || !String(roomId).trim()) return socket.emit("errorMsg", "Room ID required");
    if (!tttRooms.has(roomId)) tttRooms.set(roomId, { state: createState(), players: [], turn: "X", started: false });
    const room = tttRooms.get(roomId);
    if (!room.players.find(p => p.socketId === socket.id)) {
      if (room.players.length < 2) {
        const symbol = room.players.length === 0 ? "X" : "O";
        room.players.push({ socketId: socket.id, userId, username, symbol });
      }
      socket.join(roomId);
    }
    if (room.players.length === 2) room.started = true;
    io.to(roomId).emit("roomUpdate", summarize(roomId));
    io.to(roomId).emit("gameState", statePayload(room));
  });

  socket.on("playerMove", ({ roomId, index }) => {
    const room = tttRooms.get(roomId);
    if (!room || !room.started) return;
    if (room.state.winner) return;
    if (room.state.board[index]) return;
    const me = room.players.find(p => p.socketId === socket.id);
    if (!me || me.symbol !== room.turn) return;
    room.state.board[index] = room.turn;
    room.state.moves++;
    const w = winner(room.state.board);
    if (w) {
      room.state.winner = w;
      io.to(roomId).emit("gameState", statePayload(room));
      io.to(roomId).emit("gameOver", { winner: w });
      return;
    }
    if (room.state.moves === 9) {
      room.state.winner = "draw";
      io.to(roomId).emit("gameState", statePayload(room));
      io.to(roomId).emit("gameOver", { winner: "draw" });
      return;
    }
    room.turn = room.turn === "X" ? "O" : "X";
    io.to(roomId).emit("gameState", statePayload(room));
  });

  socket.on("restart", ({ roomId }) => {
    const room = tttRooms.get(roomId);
    if (!room) return;
    room.state = createState();
    room.turn = "X";
    room.started = room.players.length === 2;
    io.to(roomId).emit("gameState", statePayload(room));
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      const room = tttRooms.get(roomId);
      if (!room) continue;
      room.players = room.players.filter(p => p.socketId !== socket.id);
      room.started = room.players.length === 2;
      io.to(roomId).emit("roomUpdate", summarize(roomId));
      if (room.players.length === 0) tttRooms.delete(roomId);
    }
  });
}

function summarize(roomId) {
  const room = tttRooms.get(roomId);
  return { roomId, players: room.players.map(p => ({ username: p.username, symbol: p.symbol })), started: room.started };
}
function statePayload(room) {
  return { board: room.state.board, moves: room.state.moves, winner: room.state.winner || null, turn: room.turn };
}
function winner(b) {
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return null;
}
