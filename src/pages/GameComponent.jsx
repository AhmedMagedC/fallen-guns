import React, { useEffect } from 'react';
import { FirstScene } from "../scenes/firstscene.js";
import { BootLoader } from "../scenes/bootloader.js";
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const GameComponent = () => {
  const location = useLocation();
  const { socketUrl } = location.state || {}; // Retrieve the socket connection URL from route state

  useEffect(() => {
    if (socketUrl) {
      // Reconnect to the socket server using the URL
      const socket = io(socketUrl); // Reconnect using the URL from the Lobby
      // socket.emit("hello")
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
    }
  }, [socketUrl]);

  return <div id="phaser-game" />;
};

export default GameComponent;
