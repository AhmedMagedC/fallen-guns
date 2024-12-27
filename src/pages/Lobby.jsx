// src/components/Lobby.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useSocket } from "./SocketContext";
import { useNavigate, useLocation } from "react-router-dom";

const socket = io(); // Connect to the server

function Lobby() {
  const { setSocket } = useSocket();
  setSocket(socket);
  const [players, setPlayers] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // On initial connection
    socket.emit("joinLobby", {
      charStats: JSON.parse(localStorage.getItem("selectedChar")),
    });

    // Listen for player updates
    socket.on("lobbyUpdate", (players) => {
      setPlayers(players);
      console.log(players);
    });

    // Identify if the player is the owner
    socket.on("setOwner", () => {
      setIsOwner(true);
    });

    // Start the game
    socket.on("startGame", () => {
      setGameStarted(true);
      navigate("/game"); // Redirect to the Phaser game page
    });

    return () => {
      // socket.disconnect();
    };
  }, []);

  const startGame = () => {
    socket.emit("startGame");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", color: "white" }}>
      <h1>Lobby</h1>
      <h2>Players in Lobby:</h2>
      <ul>
        {/* {Object.keys(players).map((id) => (
          <li key={id}>{players[id].charStats.name}</li>
        ))} */}
      </ul>
      {isOwner && !gameStarted && (
        <button onClick={startGame}>Start Game</button>
      )}
      {gameStarted && <p>Game is starting...</p>}
    </div>
  );
}

export default Lobby;
