import { Player } from "../player/player.js";

export class FirstScene extends Phaser.Scene {
  constructor() {
    super({
      key: "firstscene",
      physics: {
        default: "arcade",
        arcade: {
          gravity: {
            y: 800,
          },
        },
      },
    });
  }

  preload() {}

  create() {
    this.players = {}; // Store all players
    this.socket = io(); // Connect to the server

    this.add.image(450, 350, "background");

    const ground = this.physics.add.staticImage(0, 720, "platform");

    // Listen for player data from the server
    this.socket.on("playerData", (players) => {
      Object.keys(players).forEach((id) => {
        if (!this.players[id]) {
          const { x, y } = players[id];
          const currentState = players[id].state;
          this.players[id] = new Player(this, x, y, currentState, "frog");
          this.players[id].state = currentState;
          this.players[id].playAnim(currentState);
          this.physics.add.collider(this.players[id], ground);
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
      // make all clients see the change of some client's movement
      if (data.id != this.socket.id) {
        if (data.x != this.players[data.id].x)
          this.players[data.id].setX(data.x);
        if (data.y != this.players[data.id].y) {
          this.players[data.id].setY(data.y);
          this.players[data.id].body.setVelocityY(0); // if not for this line , (for some reason) it misses up with the player's rendering when the gravity pulls down the player
        }
      }
    });
    this.socket.on("syncState", (data) => {
      // make all clients see the change of some client's state (idle,Running,jumping....)
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
      this.players[this.socket.id].updateMovement();
      let updatedState = this.players[this.socket.id].currentState;
      this.socket.emit("updateState", {
        id: this.socket.id,
        state: updatedState,
      });
      this.socket.emit("updatePosition", {
        x: this.players[this.socket.id].x,
        y: this.players[this.socket.id].y,
        id: this.socket.id,
      });
    }
  }
}
