import React, { useEffect, useState } from "react";
import { FirstScene } from "../scenes/firstscene.js";
import { BootLoader } from "../scenes/bootloader.js";
import { useSocket } from "./SocketContext";
import { useNavigate } from "react-router-dom";
import "./style.css"; // Import the same CSS file for consistent styling

const GameComponent = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false); // State to control modal visibility

  useEffect(() => {
    if (socket) {
      const ratio = Math.max(
        window.innerWidth / window.innerHeight,
        window.innerHeight / window.innerWidth
      );
      const DEFAULT_HEIGHT = 720;
      const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT;

      const config = {
        type: Phaser.AUTO,
        parent: "phaser-game",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
        },
        physics: {
          default: "arcade",
          arcade: {
            debug: false,
            gravity: {
              y: 800,
            },
          },
        },
        scene: [BootLoader, FirstScene],
      };

      const game = new Phaser.Game(config);
      game.scene.start("bootloader", socket);

      // Push a dummy state to history
      window.history.pushState(null, "", window.location.href);

      // Handle the back button
      const handlePopState = () => {
        // Show the modal instead of a default confirmation
        setShowExitModal(true);
      };

      // Add event listener
      window.addEventListener("popstate", handlePopState);

      // Cleanup on unmount
      return () => {
        window.removeEventListener("popstate", handlePopState);
        game.destroy(true);
      };
    }
  }, []);

  // Function to confirm exit
  const confirmExit = () => {
    if (socket) socket.disconnect();
    navigate("/"); // Redirect to the main menu
  };

  // Function to cancel exit
  const cancelExit = () => {
    // Push the same state to reset history interaction
    window.history.pushState(null, "", window.location.href);
    setShowExitModal(false);
  };

  return (
    <div>
      <div id="phaser-game" />
      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Leave Game?</h3>
            <p>Are you sure you want to leave the game and return to the main menu?</p>
            <div className="modal-buttons">
              <button onClick={confirmExit} className="btn-confirm">
                Yes
              </button>
              <button onClick={cancelExit} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameComponent;
