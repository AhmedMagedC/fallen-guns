import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSocket } from "./SocketContext";
import { useNavigate, useLocation } from "react-router-dom";
import background from "../assets/backgrounds/lobby.png";
import "./style.css";

function Lobby() {
  const { socket, setSocket } = useSocket();
  const socketRef = useRef(null);
  const location = useLocation();
  const { character, roomId, kills, name } = location.state || {};
  const [players, setPlayers] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    setSocket(socket);

    socket.emit("joinLobby", { charStats: character, roomId, kills, name });

    socket.on("lobbyUpdate", (players) => {
      setPlayers(players);
    });

    socket.on("startGame", () => {
      navigate("/game");
    });

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      setShowExitModal(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const confirmExit = () => {
    socketRef.current?.disconnect();
    navigate("/");
  };

  const cancelExit = () => {
    window.history.pushState(null, "", window.location.href);
    setShowExitModal(false);
  };

  const startGame = () => {
    socketRef.current?.emit("startGame");
  };

  const ExitModal = ({ onConfirm, onCancel }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Leave Lobby?</h3>
        <p>
          Are you sure you want to leave the lobby and return to the main menu?
        </p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="btn-confirm">
            Yes
          </button>
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="main">
      <img src={background} className="background" />
      <div className="side">
        <h3>players</h3>
        <ul>
          {Object.keys(players).map((id) => (
            <li key={id}>
              <img
                src={`../../public/assets/Characters/${players[id].charStats.name}/${players[id].charStats.name}.png`}
                alt="player character"
              />
              <span>{players[id].playerName}</span>
            </li>
          ))}
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
      {showExitModal && (
        <ExitModal onConfirm={confirmExit} onCancel={cancelExit} />
      )}
    </div>
  );
}

export default Lobby;
