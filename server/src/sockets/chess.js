// import { createState, applyMove } from "../games/chess/engine.js";
// import Room from "../models/Room.js";
// import UserProgress from "../models/UserProgress.js";

// export const chessRooms = new Map(); // key = String(Room._id)
// const key = (id) => String(id);

// async function findOrCreateDoc(roomId) {
//   let doc = await Room.findOne({ roomId, game: "chess" }).sort({ updatedAt: -1 });
//   if (!doc) {
//     doc = await Room.create({
//       roomId,
//       roomName: "",
//       game: "chess",
//       players: [],
//       state: createState(),
//       turn: "w",
//       winner: null,
//       started: false,
//       starter: "w",
//     });
//   }
//   return doc;
// }

// async function persist(docId, room) {
//   await Room.findByIdAndUpdate(docId, {
//     $set: {
//       state: room.state,
//       turn: room.state.turn,
//       winner: room.winner || null,
//       started: room.players.length === 2,
//       starter: room.starter || "w",
//       players: room.players.map(p => ({ userId: p.userId, username: p.username, color: p.color })),
//       updatedAt: new Date(),
//     }
//   });
// }

// export default function chess(socket, io) {
//   socket.on("joinRoom", async ({ roomId, userId, username }) => {
//     if (!roomId || !String(roomId).trim()) return socket.emit("errorMsg", "Room ID required");

//     const doc = await findOrCreateDoc(roomId);
//     const k = key(doc._id);

//     if (!chessRooms.has(k)) {
//       // Hydrate from DB exactly as persisted
//       chessRooms.set(k, {
//         docId: doc._id,
//         roomId: doc.roomId,
//         state: doc.state || createState(),
//         players: [],
//         winner: doc.winner || null,
//         starter: doc.starter || "w",
//       });
//     }

//     const room = chessRooms.get(k);

//     // Attach player with color assignment based on current players array
//     if (!room.players.find(p => p.socketId === socket.id)) {
//       if (room.players.length < 2) {
//         const existingColors = room.players.map(p => p.color);
//         const color = existingColors.includes("w") ? "b" : "w";
//         room.players.push({ socketId: socket.id, userId, username, color });
//       } else {
//         // spectators can join; they get no color and cannot move
//       }
//       socket.join(k);
//     }

//     // Emit authoritative state from memory (which mirrors DB)
//     await persist(room.docId, room);
//     io.to(k).emit("roomUpdate", { players: room.players.map(p => ({ username: p.username, color: p.color })) });
//     io.to(socket.id).emit("gameState", { // send to this socket immediately
//       matrix: room.state.matrix,
//       turn: room.state.turn,
//       winner: room.winner || null,
//       started: room.players.length === 2
//     });
//   });

//   socket.on("move", async ({ from, to }) => {
//     const joined = [...socket.rooms].find(r => r !== socket.id && chessRooms.has(r));
//     if (!joined) return;
//     const room = chessRooms.get(joined);
//     if (!room) return;

//     const started = room.players.length === 2;
//     if (!started || room.winner) return;

//     const me = room.players.find(p => p.socketId === socket.id);
//     if (!me) return;

//     // Strict turn: only current side can move
//     if (room.state.turn !== me.color) return;

//     // Basic color ownership: must move your own piece
//     const piece = room.state.matrix[from.r]?.[from.c];
//     if (!piece) return;
//     const isWhite = piece === piece.toUpperCase();
//     if ((isWhite && me.color !== "w") || (!isWhite && me.color !== "b")) return;

//     // Apply move
//     room.state = applyMove(room.state, from, to);

//     // End if king captured
//     const flat = room.state.matrix.flat().join("");
//     const hasWhiteKing = flat.includes("K");
//     const hasBlackKing = flat.includes("k");
//     if (!hasWhiteKing || !hasBlackKing) {
//       room.winner = hasWhiteKing ? "w" : hasBlackKing ? "b" : "draw";
//       // Alternate starter for next game
//       room.starter = room.starter === "w" ? "b" : "w";

//       const winPlayer = room.players.find(p => p.color === room.winner);
//       if (winPlayer) {
//         await UserProgress.findOneAndUpdate(
//           { userId: winPlayer.userId },
//           { $inc: { "totals.chess.wins": 1 }, $set: { updatedAt: new Date(), username: winPlayer.username } },
//           { upsert: true }
//         );
//       }
//       await Room.findByIdAndUpdate(room.docId, {
//         $push: { history: { winner: room.winner, endedAt: new Date() } },
//         $set: { state: room.state, winner: room.winner, starter: room.starter }
//       });
//       io.to(joined).emit("gameState", { matrix: room.state.matrix, turn: room.state.turn, winner: room.winner, started: true });
//       io.to(joined).emit("gameOver", { winner: room.winner });
//       return;
//     }

//     await persist(room.docId, room);
//     io.to(joined).emit("gameState", { matrix: room.state.matrix, turn: room.state.turn, winner: null, started: room.players.length === 2 });
//   });

//   socket.on("restart", async () => {
//     const joined = [...socket.rooms].find(r => r !== socket.id && chessRooms.has(r));
//     if (!joined) return;
//     const room = chessRooms.get(joined);

//     // Fresh state with turn set to starter (alternating each round)
//     const starter = room.starter || "w";
//     const fresh = createState();
//     fresh.turn = starter;
//     room.state = fresh;
//     room.winner = null;

//     await persist(room.docId, room);
//     io.to(joined).emit("gameState", { matrix: room.state.matrix, turn: room.state.turn, winner: null, started: room.players.length === 2 });
//   });

//   socket.on("disconnecting", async () => {
//     for (const r of socket.rooms) {
//       if (!chessRooms.has(r)) continue;
//       const room = chessRooms.get(r);
//       room.players = room.players.filter(p => p.socketId !== socket.id);
//       await persist(room.docId, room);
//       io.to(r).emit("roomUpdate", { players: room.players.map(p => ({ username: p.username, color: p.color })) });
//       if (room.players.length === 0) chessRooms.delete(r);
//     }
//   });
// }

import Room from "../models/Room.js";
import UserProgress from "../models/UserProgress.js";
import { createState, getSnapshot, toAlg, getLegalMoves, applyMoveIfLegal } from "../games/chess/engine.js";

export const chessRooms = new Map();
const key = (id) => String(id);

async function findOrCreateDoc(roomId) {
  let doc = await Room.findOne({ roomId, game: "chess" }).sort({ updatedAt: -1 });
  if (!doc) {
    const init = createState();
    doc = await Room.create({
      roomId,
      roomName: "",
      game: "chess",
      players: [],
      state: init,      // { fen }
      turn: "w",
      winner: null,
      started: false,
      starter: "w",
    });
  }
  return doc;
}

async function persist(docId, room) {
  await Room.findByIdAndUpdate(docId, {
    $set: {
      state: room.state,                      // { fen }
      turn: getSnapshot(room.state.fen).turn, // redundancy for UI
      winner: room.winner || null,
      started: room.players.length === 2,
      starter: room.starter || "w",
      players: room.players.map(p => ({ userId: p.userId, username: p.username, color: p.color })),
      updatedAt: new Date(),
    }
  });
}

export default function chess(socket, io) {
  socket.on("joinRoom", async ({ roomId, userId, username }) => {
    if (!roomId || !String(roomId).trim()) return socket.emit("errorMsg", "Room ID required");

    const doc = await findOrCreateDoc(roomId);
    const k = key(doc._id);

    if (!chessRooms.has(k)) {
      chessRooms.set(k, {
        docId: doc._id,
        roomId: doc.roomId,
        state: (doc.state && doc.state.fen) ? doc.state : createState(),
        players: [],
        winner: doc.winner || null,
        starter: doc.starter || "w",
      });
    }
    const room = chessRooms.get(k);

    // Attach player with color assignment that fills w then b
    if (!room.players.find(p => p.socketId === socket.id)) {
      if (room.players.length < 2) {
        const taken = room.players.map(p => p.color);
        const color = taken.includes("w") ? "b" : "w";
        room.players.push({ socketId: socket.id, userId, username, color });
      }
      socket.join(k);
    }

    await persist(room.docId, room);
    const snap = getSnapshot(room.state.fen);
    io.to(k).emit("roomUpdate", { players: room.players.map(p => ({ username: p.username, color: p.color })) });
    io.to(socket.id).emit("gameState", {
      matrix: snap.matrix,
      turn: snap.turn,
      winner: room.winner || null,
      started: room.players.length === 2
    });
  });

  socket.on("move", async ({ from, to, promotion }) => {
    const joined = [...socket.rooms].find(r => r !== socket.id && chessRooms.has(r));
    if (!joined) return;
    const room = chessRooms.get(joined);
    if (!room) return;

    const started = room.players.length === 2;
    if (!started || room.winner) return;

    const me = room.players.find(p => p.socketId === socket.id);
    if (!me) return;

    // Always take a fresh snapshot from the current FEN to avoid race/staleness
    const snap = getSnapshot(room.state.fen);
    if (snap.turn !== me.color) return;

    // Must move own piece
    const piece = snap.matrix[from.r]?.[from.c];
    if (!piece) return;
    const isWhite = piece === piece.toUpperCase();
    if ((isWhite && me.color !== "w") || (!isWhite && me.color !== "b")) return;

    // Convert to algebraic squares on the server
    const algMove = { from: toAlg(from.r, from.c), to: toAlg(to.r, to.c) };
    if (promotion) algMove.promotion = String(promotion).toLowerCase();

    // Validate strictly against legal verbose list before applying
    const legal = getLegalMoves(room.state.fen);
    const legalSameSquares = legal.filter(m => m.from === algMove.from && m.to === algMove.to);
    if (legalSameSquares.length === 0) {
      // ignore silently; client will re-sync with emitted state
      return;
    }
    // If promotion needed but not provided, default to queen
    if (legalSameSquares.some(m => !!m.promotion) && !algMove.promotion) {
      algMove.promotion = "q";
    }
    // Apply if legal (engine cross-check)
    const result = applyMoveIfLegal(room.state.fen, algMove);
    if (!result.ok) {
      // silently ignore invalid attempts
      return;
    }

    room.state.fen = result.fen;

    if (result.over) {
      room.winner = result.winner; // "w" | "b" | "draw"
      room.starter = room.starter === "w" ? "b" : "w"; // alternate next game

      const winnerPlayer = room.players.find(p => p.color === room.winner);
      if (winnerPlayer && result.winner !== "draw") {
        await UserProgress.findOneAndUpdate(
          { userId: winnerPlayer.userId },
          { $inc: { "totals.chess.wins": 1 }, $set: { updatedAt: new Date(), username: winnerPlayer.username } },
          { upsert: true }
        );
      }
      await Room.findByIdAndUpdate(room.docId, {
        $push: { history: { winner: room.winner, endedAt: new Date() } },
        $set: { state: room.state, winner: room.winner, starter: room.starter }
      });

      const snapAfter = getSnapshot(room.state.fen);
      io.to(joined).emit("gameState", { matrix: snapAfter.matrix, turn: snapAfter.turn, winner: room.winner, started: true });
      io.to(joined).emit("gameOver", { winner: room.winner });
      return;
    }

    await persist(room.docId, room);
    const snapAfter = getSnapshot(room.state.fen);
    io.to(joined).emit("gameState", { matrix: snapAfter.matrix, turn: snapAfter.turn, winner: null, started: room.players.length === 2 });
  });

  socket.on("restart", async () => {
    const joined = [...socket.rooms].find(r => r !== socket.id && chessRooms.has(r));
    if (!joined) return;
    const room = chessRooms.get(joined);

    const fresh = createState(); // standard initial fen (white to move)
    room.state = fresh;
    room.winner = null;

    await persist(room.docId, room);
    const snap = getSnapshot(room.state.fen);
    io.to(joined).emit("gameState", { matrix: snap.matrix, turn: snap.turn, winner: null, started: room.players.length === 2 });
  });

  socket.on("disconnecting", async () => {
    for (const r of socket.rooms) {
      if (!chessRooms.has(r)) continue;
      const room = chessRooms.get(r);
      room.players = room.players.filter(p => p.socketId !== socket.id);
      await persist(room.docId, room);
      io.to(r).emit("roomUpdate", { players: room.players.map(p => ({ username: p.username, color: p.color })) });
      if (room.players.length === 0) chessRooms.delete(r);
    }
  });
}
