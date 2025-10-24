import express from "express";

export default function roomsRouter({ tttRooms, chessRooms }) {
  const r = express.Router();

  r.get("/tictactoe", (_req, res) => {
    const list = Array.from(tttRooms.entries()).map(([id, room]) => ({
      id,
      players: room.players.map(p => ({ username: p.username, symbol: p.symbol })),
      started: room.started,
    }));
    res.json(list);
  });

  r.get("/chess", (_req, res) => {
    const list = Array.from(chessRooms.entries()).map(([id, room]) => ({
      id,
      players: room.players.map(p => ({ username: p.username, color: p.color })),
    }));
    res.json(list);
  });

  return r;
}
