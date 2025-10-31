import { createState } from "../games/tictactoe/engine.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import UserProgress from "../models/UserProgress.js";

export const tttRooms = new Map(); // key = String(Room._id)
const key = (id) => String(id);

async function findOrCreateDoc(roomId) {
  let doc = await Room.findOne({ roomId, game: "ttt" }).sort({ updatedAt: -1 });
  if (!doc) {
    doc = await Room.create({
      roomId,
      roomName: "",
      game: "ttt",
      players: [],
      state: createState(),
      turn: "X",
      winner: null,
      started: false,
      starter: "X", // default
    });
  }
  return doc;
}

async function persist(docId, room) {
  await Room.findByIdAndUpdate(docId, {
    $set: {
      state: room.state,
      turn: room.turn,
      winner: room.state.winner || null,
      started: room.started,
      starter: room.starter || "X",
      players: room.players.map(p => ({
        userId: p.userId, username: p.username, symbol: p.symbol, wins: p.wins || 0
      })),
      updatedAt: new Date(),
    }
  });
}

export default function tictactoe(socket, io) {
  socket.on("joinRoom", async ({ roomId, userId, username }) => {
    if (!roomId || !String(roomId).trim()) return socket.emit("errorMsg", "Room ID required");

    const doc = await findOrCreateDoc(roomId);
    const k = key(doc._id);

    if (!tttRooms.has(k)) {
      tttRooms.set(k, {
        docId: doc._id,
        roomId: doc.roomId,
        state: doc.state?.board ? doc.state : createState(),
        players: [],
        turn: doc.turn || "X",
        winner: doc.winner || null,
        started: !!doc.started,
        starter: doc.starter || "X",
      });
    }

    const room = tttRooms.get(k);

    if (!room.players.find(p => p.socketId === socket.id)) {
      if (room.players.length < 2) {
        const symbol = room.players.length === 0 ? "X" : "O";
        room.players.push({ socketId: socket.id, userId, username, symbol, wins: 0 });
        await User.findByIdAndUpdate(userId, { $inc: { gamesJoined: 1 } });
        await UserProgress.findOneAndUpdate(
          { userId },
          { $inc: { "totals.ttt.gamesJoined": 1 }, $set: { updatedAt: new Date(), username } },
          { upsert: true }
        );
      }
      socket.join(k);
    }

    room.started = room.players.length === 2;
    await persist(room.docId, room);

    io.to(k).emit("roomUpdate", {
      roomId: room.roomId,
      players: room.players.map(p => ({ username: p.username, symbol: p.symbol, wins: p.wins||0 })),
      started: room.started,
    });
    io.to(k).emit("gameState", {
      board: room.state.board, moves: room.state.moves, winner: room.state.winner || null, turn: room.turn
    });
  });

  socket.on("playerMove", async ({ index }) => {
    const joined = [...socket.rooms].find(r => r !== socket.id && tttRooms.has(r));
    if (!joined) return;
    const room = tttRooms.get(joined);
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

      // Toggle starter for the next game
      room.starter = room.starter === "X" ? "O" : "X";

      const winnerPlayer = room.players.find(p => p.symbol === w);
      if (winnerPlayer) {
        await UserProgress.findOneAndUpdate(
          { userId: winnerPlayer.userId },
          { $inc: { "totals.ttt.wins": 1 }, $set: { updatedAt: new Date(), username: winnerPlayer.username } },
          { upsert: true }
        );
      }
      await Room.findByIdAndUpdate(room.docId, {
        $push: { history: { winner: w, endedAt: new Date() } },
        $set: { state: room.state, winner: w, starter: room.starter }
      });
      io.to(joined).emit("gameState", { board: room.state.board, moves: room.state.moves, winner: w, turn: room.turn });
      io.to(joined).emit("gameOver", { winner: w });
      return;
    }

    if (room.state.moves === 9) {
      room.state.winner = "draw";
      // Toggle starter on draw as well
      room.starter = room.starter === "X" ? "O" : "X";

      await Room.findByIdAndUpdate(room.docId, {
        $push: { history: { winner: "draw", endedAt: new Date() } },
        $set: { state: room.state, winner: "draw", starter: room.starter }
      });
      io.to(joined).emit("gameState", { board: room.state.board, moves: room.state.moves, winner: "draw", turn: room.turn });
      io.to(joined).emit("gameOver", { winner: "draw" });
      return;
    }

    room.turn = room.turn === "X" ? "O" : "X";
    await persist(room.docId, room);
    io.to(joined).emit("gameState", { board: room.state.board, moves: room.state.moves, winner: null, turn: room.turn });
  });

  socket.on("restart", async () => {
    const joined = [...socket.rooms].find(r => r !== socket.id && tttRooms.has(r));
    if (!joined) return;
    const room = tttRooms.get(joined);

    // Start next game using the toggled starter
    const starter = room.starter || "X";
    room.state = createState();
    room.turn = starter;
    room.started = room.players.length === 2;
    await persist(room.docId, room);
    io.to(joined).emit("gameState", { board: room.state.board, moves: room.state.moves, winner: null, turn: room.turn });
  });

  socket.on("disconnecting", async () => {
    for (const r of socket.rooms) {
      if (!tttRooms.has(r)) continue;
      const room = tttRooms.get(r);
      room.players = room.players.filter(p => p.socketId !== socket.id);
      room.started = room.players.length === 2;
      await persist(room.docId, room);
      io.to(r).emit("roomUpdate", {
        roomId: room.roomId,
        players: room.players.map(p => ({ username: p.username, symbol: p.symbol, wins: p.wins||0 })),
        started: room.started,
      });
      if (room.players.length === 0) tttRooms.delete(r);
    }
  });
}

function winner(b) {
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return null;
}
