import { Player } from "./player/player.js";

class MyScene extends Phaser.Scene {
  constructor() {
    super({
      key: "Level1",
      physics: {
        arcade: {
          debug: false,
          gravity: { y: 200 },
        },
      },
    });
  }

  preload() {
    this.load.image("sky", "/assets/sky.png");
    this.load.image("star", "/assets/star.png");
    this.load.spritesheet("ninja", "./assets/Ninja Frog/Idle (32x32).png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("run", "./assets/Ninja Frog/Run (32x32).png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    this.add.image(400, 300, "sky");
    this.add.image(400, 300, "star");

    this.players = {}; // Store all players
    this.socket = io(); // Connect to the server
    // Listen for player data from the server
    this.socket.on("playerData", (players) => {
      console.log(`${this.socket.id}`);
      Object.keys(players).forEach((id) => {
        if (!this.players[id]) {
          const { x, y } = players[id];
          this.players[id] = new Player(this, x, y, "ninja_frog");
        }
      });
    });

    this.socket.on("removePlayer", (players) => {
      Object.keys(this.players).forEach((id) => {
        if (!players[id]) {
          this.players[id].destroy();
          delete this.players[id];
        }
      });
    });

    this.socket.on("syncAll", (data) => {
      if (data.id != this.socket.id) {
        this.players[data.id].setPosition(data.x, data.y);
      }
    });
  }

  update() {
    if (this.players[this.socket.id]) {
      if (this.players[this.socket.id].update()) {
        this.socket.emit("updatePosition", {
          x: this.players[this.socket.id].x,
          y: this.players[this.socket.id].y,
          id: this.socket.id,
        });
      }
    }
  }
}

const ratio = Math.max(
  window.innerWidth / window.innerHeight,
  window.innerHeight / window.innerWidth
);
const DEFAULT_HEIGHT = 720; // any height you want
const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT;

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
};

var game = new Phaser.Game(config);

game.scene.add("test", new MyScene(), true);
