import { Chess } from "chess.js";

export function createState() {
  const game = new Chess();
  return { game };
}

export function getBoard(state) {
  return state.game.board();
}

export function applyMove(state, move) {
  // move = { from: "e2", to: "e4" }
  const result = state.game.move(move);
  return { ...state, lastMove: result };
}

export function getValidMoves(state, square) {
  return state.game.moves({ square, verbose: true });
}

export function isGameOver(state) {
  const g = state.game;
  return {
    over: g.isGameOver(),
    checkmate: g.isCheckmate(),
    draw: g.isDraw(),
    turn: g.turn(),
  };
}
