export function validateScore(score) {
  if (typeof score !== "number" || score < 0 || score > 1000000) return false;
  return true;
}
