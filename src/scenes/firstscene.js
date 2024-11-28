import { Player } from "../player/player.js";

export class FirstScene extends Phaser.Scene {
  constructor() {
    super({
      key: "firstscene",
      physics: {
        arcade: {
          debug: false,
          gravity: { y: 200 },
        },
      },
    });
  }

  preload() {}

  create() {
    this.add.image(450, 350, "background");

    this.players = {}; // Store all players
    this.socket = io(); // Connect to the server

    // Listen for player data from the server
    this.socket.on("playerData", (players) => {
      console.log(`${this.socket.id}`);
      Object.keys(players).forEach((id) => {
        if (!this.players[id]) {
          const { x, y } = players[id];
          this.players[id] = new Player(this, x, y, "frog");
          this.players[id].state = "idle";
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

    this.socket.on("syncPosition", (data) => {
      if (data.id != this.socket.id) {
        this.players[data.id].setPosition(data.x, data.y);
      }
    });
    this.socket.on("syncState", (data) => {
      if (
        data.id != this.socket.id &&
        data.state != this.players[data.id].state
      ) {
        this.players[data.id].playAnim(data.state);
        this.players[data.id].state = data.state;
      }
    });
  }

  update() {
    if (this.players[this.socket.id]) {
      var updatedState = this.players[this.socket.id].updateMovement();
      if (updatedState !== "idle") {
        this.socket.emit("updateState", {
          id: this.socket.id,
          state: updatedState,
        });
        this.socket.emit("updatePosition", {
          x: this.players[this.socket.id].x,
          y: this.players[this.socket.id].y,
          id: this.socket.id,
        });
      } else
        this.socket.emit("updateState", {
          id: this.socket.id,
          state: updatedState,
        });
    }
  }
}
