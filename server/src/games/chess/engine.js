export function initialMatrix() {
  const b = Array(8).fill(null).map(() => Array(8).fill(""));
  const back = ["r","n","b","q","k","b","n","r"];
  b[0] = back.slice();
  b[1] = Array(8).fill("p");
  b[6] = Array(8).fill("P");
  b[7] = back.map(c => c.toUpperCase());
  return b;
}
export function createState() {
  return { matrix: initialMatrix(), turn: "w", history: [] };
}
export function applyMove(state, from, to) {
  const inb = (r,c) => r>=0 && r<8 && c>=0 && c<8;
  if (!inb(from.r, from.c) || !inb(to.r, to.c)) return state;
  const piece = state.matrix[from.r][from.c];
  if (!piece) return state;
  const isWhite = piece === piece.toUpperCase();
  if ((state.turn === "w" && !isWhite) || (state.turn === "b" && isWhite)) return state;
  state.matrix[to.r][to.c] = piece;
  state.matrix[from.r][from.c] = "";
  state.history.push({ from, to, piece });
  state.turn = state.turn === "w" ? "b" : "w";
  return state;
}
