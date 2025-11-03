// import { Chess } from "chess.js";

// export function createState() {
//   const game = new Chess();
//   return { game };
// }

// export function getBoard(state) {
//   return state.game.board();
// }

// export function applyMove(state, move) {
//   // move = { from: "e2", to: "e4" }
//   const result = state.game.move(move);
//   return { ...state, lastMove: result };
// }

// export function getValidMoves(state, square) {
//   return state.game.moves({ square, verbose: true });
// }

// export function isGameOver(state) {
//   const g = state.game;
//   return {
//     over: g.isGameOver(),
//     checkmate: g.isCheckmate(),
//     draw: g.isDraw(),
//     turn: g.turn(),
//   };
// }

import { Chess } from "chess.js";

// Create initial FEN or from a valid fen string
export function createState(fen = null) {
  const game = new Chess();
  if (fen && Chess.validateFen(fen).ok) game.load(fen);
  return { fen: game.fen() };
}

// Snapshot helpers
export function getSnapshot(fen) {
  const game = new Chess();
  game.load(fen);
  const board = game.board();
  const matrix = board.map(row =>
    row.map(cell => cell ? (cell.color === "w" ? cell.type.toUpperCase() : cell.type) : "")
  );
  return { matrix, turn: game.turn() };
}

// Convert 0-based r,c to algebraic like "e2". r=0 is rank 8, c=0 is file a.
export function toAlg(r, c) {
  const file = "abcdefgh"[c];
  const rank = 8 - r;
  return `${file}${rank}`;
}

// Get legal verbose moves from fen
export function getLegalMoves(fen) {
  const game = new Chess();
  game.load(fen);
  return game.moves({ verbose: true }); // [{ from, to, san, flags, promotion?, piece, color }]
}

// Apply a move only if legal. move can be { from:"e2", to:"e4", promotion? }.
// Returns { ok, fen, over, winner, reason }
export function applyMoveIfLegal(fen, move) {
  const game = new Chess();
  game.load(fen);

  // Find a legal candidate matching from/to (and promotion if needed)
  const legal = game.moves({ verbose: true });
  const candidates = legal.filter(m => m.from === move.from && m.to === move.to);

  if (candidates.length === 0) {
    return { ok: false, fen: game.fen(), over: false, winner: null, reason: "illegal_from_to" };
  }

  let chosen = candidates[0];
  // If any candidate is a promotion, require a valid promotion choice
  if (candidates.some(m => !!m.promotion)) {
    const promo = (move.promotion || "").toLowerCase();
    const allowed = ["q","r","b","n"];
    if (!allowed.includes(promo)) {
      // default to queen if client omitted, to reduce UX errors
      chosen = candidates.find(m => m.promotion === "q") || candidates[0];
      move.promotion = chosen.promotion || "q";
    } else {
      const exact = candidates.find(m => m.promotion === promo);
      if (exact) chosen = exact;
      else return { ok: false, fen: game.fen(), over: false, winner: null, reason: "illegal_promotion" };
    }
  }

  // Use chess.js to execute; since it's verified legal, it will not throw
  game.move({ from: chosen.from, to: chosen.to, promotion: chosen.promotion });

  const over = game.isGameOver();
  let winner = null;
  if (over) {
    if (game.isDraw()) winner = "draw";
    else winner = game.turn() === "w" ? "b" : "w";
  }
  return { ok: true, fen: game.fen(), over, winner, reason: null };
}
