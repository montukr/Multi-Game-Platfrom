import express from "express";

export default function roomsRouter({ tttRooms, chessRooms }) {
  const r = express.Router();

  r.get("/tictactoe", (_req, res) => {
    const list = Array.from(tttRooms.entries()).map(([dbKey, room]) => ({
      id: room.roomId,
      dbKey,
      players: room.players.map(p => ({ username: p.username, symbol: p.symbol, wins: p.wins || 0 })),
      started: room.started,
      winner: room.state?.winner || null,
    }));
    res.json(list);
  });

  r.get("/chess", (_req, res) => {
    const list = Array.from(chessRooms.entries()).map(([dbKey, room]) => ({
      id: room.roomId,
      dbKey,
      players: room.players.map(p => ({ username: p.username, color: p.color })),
      winner: room.winner || null,
    }));
    res.json(list);
  });

  return r;
}
