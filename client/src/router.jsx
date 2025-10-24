import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import RequireAuth from "./auth/RequireAuth";
import Lobby from "./pages/Lobby";
import TicTacToe from "./pages/TicTacToe";
import Chess from "./pages/Chess";
import Snake from "./pages/Snake";
import Login from "./auth/Login";
import Register from "./auth/Register";

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
      { path: "chess/:roomId", element: <Chess /> },
      { path: "snake", element: <Snake /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);
