import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSocket } from "./SocketContext";
import { useNavigate, useLocation } from "react-router-dom";
import background from "../assets/backgrounds/lobby.png";

function Lobby() {
  const { socket, setSocket } = useSocket();
  const socketRef = useRef(null); // Use ref for the socket
  const location = useLocation();
  let { character, roomId, kills, name } = location.state || {};
  const [players, setPlayers] = useState({});
  const [displayRoomId, setRoomId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Create the socket connection only once when the component mounts
    const socket = io(); // Connect to the server
    socketRef.current = socket;

    setSocket(socket);

    // On initial connection

    socket.emit("joinLobby", {
      charStats: character,
      roomId,
      kills,
      name,
    });

    // Listen for player updates
    socket.on("lobbyUpdate", (players) => {
      setPlayers(players);
    });

    // Start the game
    socket.on("startGame", () => {
      navigate("/game"); // Redirect to the Phaser game page
    });

    window.history.pushState(null, "", window.location.href);

    // Handle the back button
    const handlePopState = () => {
      const confirmExit = window.confirm(
        "Are you sure you want to leave the lobby and return to main menu?"
      );
      if (!confirmExit) {
        // Prevent navigation
        window.history.pushState(null, "", window.location.href);
      } else {
        // Allow navigation and clean up
        socket.disconnect();
        navigate("/");
      }
    };

    // Add event listener
    window.addEventListener("popstate", handlePopState);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const startGame = () => {
    if (socketRef.current) {
      socketRef.current.emit("startGame");
    }
  };

  return (
    <div className="main">
      <img src={background} className="background" />
      <div className="side">
        <h3>players</h3>
        <ul>
          {Object.keys(players).map((id) => {
            return (
              <li key={id}>
                <img
                  src={`../../public/assets/Characters/${players[id].charStats.name}/${players[id].charStats.name}.png`}
                  alt="haha"
                />
                <span>{players[id].playerName}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="room">
        <h3>ROOM ID: </h3>
        <span>{roomId || socketRef.current?.id}</span>
      </div>
      {!roomId && (
        <button className="play" onClick={startGame}>
          PLAY!!
        </button>
      )}
    </div>
  );
}

export default Lobby;
