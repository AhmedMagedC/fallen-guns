// src/components/Lobby.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useSocket } from "./SocketContext";
import { useNavigate, useLocation } from "react-router-dom";
import background from '../assets/backgrounds/lobby.png';

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
    <div className="main">
      <img src={background} className='background' />
      <div className="side">
        <h3>players</h3>
        <ul>
          {
            Object.keys(players).map((id) => {
              console.log(players[id]);
              
              return(
                <li>
                  <img
                src={`../../public/assets/Characters/${players[id].charStats.character.name}/${players[id].charStats.character.name}.png`}
                alt='haha'
              />
              <span>{players[id].charStats.name}</span>
                </li>
              )
            })
          }
        </ul>
      </div>
      <div className="room">
        <h3>ROOM ID: </h3>
      </div>
      {isOwner && <button className="play" onClick={startGame}>PLAY!!</button>}
    </div>
  );
}

export default Lobby;
