import React, { useState } from "react";
import background from "../assets/backgrounds/main.png";
import { characterStats } from "../model/characters";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles.css";

export default function Ready() {
  const [charIndex, setCharIndex] = useState(0);
  const [warning, setWarning] = useState(false);
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(""); // State for Room ID
  const [kills, setKills] = useState(5);
  const [selectedCharacter, setSelectedCharacter] = useState(
    characterStats[charIndex]
  );
  const location = useLocation();
  const { owner } = location.state || {};
  const navigate = useNavigate();

  const updateCharacter = (index) => {
    setCharIndex(index);
    setSelectedCharacter(characterStats[index]);
  };

  const handleLeftArrow = () => {
    const newIndex =
      charIndex - 1 < 0 ? characterStats.length - 1 : charIndex - 1;
    updateCharacter(newIndex);
  };

  const handleRightArrow = () => {
    const newIndex = (charIndex + 1) % characterStats.length;
    updateCharacter(newIndex);
  };

  const handleJoin = () => {
    if (!name || (!owner && !roomId)) {
      setWarning(true);
    } else {
      setWarning(false);
      const characterKey = Object.keys(selectedCharacter)[0];
      const character = selectedCharacter[characterKey];

      navigate("/lobby", { state: { character, roomId, kills, name } });
    }
  };

  const characterKey = Object.keys(selectedCharacter)[0];
  const character = selectedCharacter[characterKey];

  return (
    <div className="main">
      <img src={background} className="background" />
      <div className="container">
        <h1 className="main-title">FALLEN</h1>
        <h1 className="main-title">GUNS</h1>
        <div className="options">
          <div className="inputs">
            <input
              className="textinput"
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {owner && (
              <div className="deaths">
                Max Kills:
                <input
                  type="number"
                  min={5}
                  value={kills}
                  onChange={(e) => setKills(e.target.value)}
                />
              </div>
            )}
            {!owner && ( // Render Room ID input if not owner
              <input
                className="textinput"
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            )}
          </div>
          <div className="char">
            <div className="pic">
              <div className="arrow left" onClick={handleLeftArrow}>
                &lt;
              </div>
              <img
                src={`../../public/assets/Characters/${characterKey}/${characterKey}.png`}
                alt={character.name}
              />
              <div className="arrow left" onClick={handleRightArrow}>
                &gt;
              </div>
            </div>
            <div className="stats">
              <p>❤️Health: {character.health}</p>
              <p>⏱️Bullet Time: {character.bulletTime}</p>
              <p>🔫Ammo: {character.ammo}</p>
              <p>💥Damage: {character.damage}</p>
            </div>
          </div>
          <button className="my-button" onClick={handleJoin}>
            Join
          </button>
          {warning && (
            <p className="warning">Please enter {name ? "Room ID" : "Name"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
