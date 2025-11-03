import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import RequireAuth from "./auth/RequireAuth";
import Lobby from "./pages/Lobby";
import TicTacToe from "./pages/TicTacToe";
import Chess from "./pages/Chess";
import Snake from "./pages/Snake";
import Profile from "./pages/Profile";
import Login from "./auth/Login";
import Register from "./auth/Register";
import TicTacToeSingle from "./pages/TicTacToeSingle";
import ChessSingle from "./pages/ChessSingle";
import Tetris from "./pages/tetris";
import FlappyBird from "./pages/FlappyBird";
import PacMan from "./pages/PacMan";
import Leaderboard from "./pages/Leaderboard.jsx";


export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Lobby /> },
      { path: "tictactoe/:roomId", element: <TicTacToe /> },
      { path: "tictactoe/single", element: <TicTacToeSingle /> },
      { path: "chess/:roomId", element: <Chess /> },
      { path: "chess/single", element: <ChessSingle /> },
      { path: "snake", element: <Snake /> },
      { path: "tetris", element: <Tetris /> },
      { path: "flappybird", element: <FlappyBird /> },
      { path: "pacman", element: <PacMan /> },
      { path: "profile", element: <Profile /> },
      { path: "/leaderboard", element: <Leaderboard /> },

    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

