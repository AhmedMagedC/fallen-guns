import React, { useEffect } from "react";
import { FirstScene } from "../scenes/firstscene.js";
import { BootLoader } from "../scenes/bootloader.js";
import { useSocket } from "./SocketContext";
import { useNavigate } from "react-router-dom";

const GameComponent = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      const ratio = Math.max(
        window.innerWidth / window.innerHeight,
        window.innerHeight / window.innerWidth
      );
      const DEFAULT_HEIGHT = 720; // any height you want
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
        const confirmExit = window.confirm(
          "Are you sure you want to leave the game and return to main menu?"
        );
        if (!confirmExit) {
          // Prevent navigation
          window.history.pushState(null, "", window.location.href);
        } else {
          // Allow navigation and clean up
          game.destroy(true); // Destroy the Phaser game instance if exiting
          socket.disconnect();
          navigate("/");
        }
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

  return <div id="phaser-game" />;
};

export default GameComponent;
