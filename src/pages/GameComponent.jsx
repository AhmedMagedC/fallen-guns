import React, { useEffect, useState } from "react";
import { MapArcadeRoom } from "../scenes/MapArcadeRoom.js";
import { BootLoader } from "../scenes/bootloader.js";
import { useSocket } from "./SocketContext";
import { useNavigate } from "react-router-dom";
import "./style.css"; // Import the same CSS file for consistent styling

const GameComponent = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false); // State to control modal visibility
  const [winnerData, setWinnerData] = useState(null); // State to store winner details
  useEffect(() => {
    if (socket) {
      const DEFAULT_WIDTH = 1920;
      const DEFAULT_HEIGHT = 1080;

      const config = {
        type: Phaser.AUTO,
        parent: "phaser-game",
        backgroundColor: "rgba(0, 0, 0, 0)",
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
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
        scene: [BootLoader, MapArcadeRoom],
      };

      const game = new Phaser.Game(config);
      game.scene.start("bootloader", socket);

      // Listen for the winner event from the server
      socket.on("game:playerWon", ({ name, id }) => {
        setWinnerData({ name, id });

        // Create the celebration effect using Phaser
        if (game.scene.keys["MapArcadeRoom"]) {
          const scene = game.scene.keys["MapArcadeRoom"];

          // Add confetti effect
          for (let i = 0; i < 200; i++) {
            const particle = scene.add.rectangle(
              Phaser.Math.Between(0, DEFAULT_WIDTH),
              Phaser.Math.Between(-100, DEFAULT_HEIGHT - 200), // Raised position
              5,
              5,
              Phaser.Display.Color.RandomRGB().color
            );

            scene.tweens.add({
              targets: particle,
              y: DEFAULT_HEIGHT + 100,
              x: particle.x + Phaser.Math.Between(-100, 100),
              duration: Phaser.Math.Between(2000, 4000),
              ease: "Cubic.easeOut",
              onComplete: () => particle.destroy(),
            });
          }

          // Display the winner's name and ID in the center of the screen
          const winnerText = scene.add.text(
            DEFAULT_WIDTH / 2 + 50, // Adjusted to move right
            DEFAULT_HEIGHT / 2 - 150, // Raised position
            `Winner: ${name} (ID: ${id})`,
            {
              font: "48px Arial",
              fill: "#ffffff", // Set text color to black
              align: "center",
            }
          );
          winnerText.setOrigin(0.5);

          // Add a glow effect
          scene.tweens.add({
            targets: winnerText,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1.2 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
          });

          // Add background pulse effect
          const backgroundRect = scene.add.rectangle(
            DEFAULT_WIDTH / 2,
            DEFAULT_HEIGHT / 2,
            DEFAULT_WIDTH,
            DEFAULT_HEIGHT,
            0x000000
          );
          backgroundRect.setAlpha(0.2);
          scene.tweens.add({
            targets: backgroundRect,
            alpha: { from: 0.2, to: 0.5 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
          });
        }
      });

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
            <p>
              Are you sure you want to leave the game and return to the main
              menu?
            </p>
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
      {winnerData && (
        <div className="winner-overlay">
          <h1
            style={{ marginTop: "-200px", marginLeft: "50px", color: "white" }}
          >
            🎉 Congratulations! 🎉
          </h1>
          <h2
            style={{ marginTop: "-150px", marginLeft: "50px", color: "white" }}
          >
            {winnerData.name} (ID: {winnerData.id}) has won the game!
          </h2>
        </div>
      )}
    </div>
  );
};

export default GameComponent;
