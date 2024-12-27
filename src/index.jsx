import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Join from "./pages/Join";
import Ready from "./pages/Ready";
import Lobby from "./pages/Lobby";
import GameComponent from "./pages/GameComponent";
import { SocketProvider } from "./pages/SocketContext";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/join" element={<Join />} />
        <Route path="/ready" element={<Ready />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<GameComponent />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <App />
  </SocketProvider>
);
