// import express from "express";
// import requireAuth from "../middleware/auth.js";
// import User from "../models/User.js";
// import UserProgress from "../models/UserProgress.js";

// const router = express.Router();

// router.get("/me", requireAuth, async (req, res) => {
//   const user = await User.findById(req.userId).select("_id email username gamesJoined");
//   res.json({
//     id: user._id,
//     email: user.email,
//     username: user.username,
//     gamesJoined: user.gamesJoined,
//   });
// });

// router.get("/progress", requireAuth, async (req, res) => {
//   const p = await UserProgress.findOne({ userId: req.userId }).lean();
//   res.json(
//     p || {
//       userId: req.userId,
//       totals: {
//         ttt:   { wins: 0, gamesJoined: 0 },
//         chess: { wins: 0, gamesJoined: 0 },
//         snake: { highestScore: 0 },
//       },
//     }
//   );
// });

// export default router;

import express from "express";
import requireAuth from "../middleware/auth.js";
import User from "../models/User.js";
import UserProgress from "../models/UserProgress.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("_id email username gamesJoined");
  res.json({
    id: user._id,
    email: user.email,
    username: user.username,
    gamesJoined: user.gamesJoined,
  });
});

router.get("/progress", requireAuth, async (req, res) => {
  const p = await UserProgress.findOne({ userId: req.userId }).lean();
  res.json(
    p || {
      userId: req.userId,
      totals: {
        ttt:   { wins: 0, gamesJoined: 0 },
        chess: { wins: 0, gamesJoined: 0 },
        snake: { highestScore: 0 },
        tetris:{ highestScore: 0 },
        flappy:{ highestScore: 0 },
        pacman:{ highestScore: 0 },
      },
    }
  );
});

export default router;
