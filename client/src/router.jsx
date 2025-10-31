// import { createBrowserRouter } from "react-router-dom";
// import App from "./App";
// import RequireAuth from "./auth/RequireAuth";
// import Lobby from "./pages/Lobby";
// import TicTacToe from "./pages/TicTacToe";
// import Chess from "./pages/Chess";
// import Snake from "./pages/Snake";
// import Login from "./auth/Login";
// import Register from "./auth/Register";

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: (
//       <RequireAuth>
//         <App />
//       </RequireAuth>
//     ),
//     children: [
//       { index: true, element: <Lobby /> },
//       { path: "tictactoe/:roomId", element: <TicTacToe /> },
//       { path: "chess/:roomId", element: <Chess /> },
//       { path: "snake", element: <Snake /> },
//     ],
//   },
//   { path: "/login", element: <Login /> },
//   { path: "/register", element: <Register /> },
// ]);

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
import Tetris from "./pages/Tetris";
import FlappyBird from "./pages/FlappyBird";
import CrossyRoad from "./pages/CrossyRoad";

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
      { path: "crossyroad", element: <CrossyRoad />},
      { path: "profile", element: <Profile /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

