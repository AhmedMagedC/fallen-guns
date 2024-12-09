import { Player } from "../player/player.js";

export class FirstScene extends Phaser.Scene {
  constructor() {
    super({
      key: "firstscene",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
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

    const background = this.add.image(0, 0, "background");

    const ground = this.physics.add
      .staticImage(100, 850, "platform")
      .setScale(1)
      .refreshBody();

    background.setOrigin(0, 0.4);
    let scaleX = this.scale.width / background.width; // Scale based on screen width
    let scaleY = this.scale.height / background.height; // Scale based on screen height
    let scale = Math.max(scaleX, scaleY); // Use the larger scale to cover the entire screen

    background.setScale(scale);
    // Listen for player data from the server
    this.socket.on("playerData", (players) => {
      Object.keys(players).forEach((id) => {
        if (!this.players[id]) {
          const { x, y } = players[id];
          const currentState = players[id].state;
          this.players[id] = new Player(this, x, y, currentState, "gang1");
          this.players[id].currentState = currentState;
          this.players[id].body.setSize(30, 80); // Adjust size for proper hitbox
          this.players[id].body.setOffset(45, 50); // Adjust Offset for proper hitbox
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
        data.state != this.players[data.id].currentState
      ) {
        this.players[data.id].playAnim(data.state);
        this.players[data.id].currentState = data.state;
      }
    });
    this.socket.on("syncBullet", (newBullet) => {
      const bullet = this.physics.add.image(newBullet.x, newBullet.y, "bullet");
      bullet.body.setVelocityX(newBullet.velocityX);
      bullet.body.setAllowGravity(false);
      this.players[this.socket.id].fireSound.play();

      Object.keys(this.players).forEach((id) => {
        if (newBullet.srcID != id) {
          // make bullet collides with all players ,except the one who fired it
          this.physics.add.overlap(this.players[id], bullet, () => {
            this.players[id].gotHit();

            bullet.destroy();

            if (this.socket.id == newBullet.srcID)
              // necessary to make the player who got hit to lose only a single point of health
              this.socket.emit("playerGotHit", id); // update the player's health
          });
        }
      });
    });

    this.socket.on("playerGotHitSync", (id, curHealth) => {
      if (curHealth <= 0) this.players[id].destroy();
    });
  }
  update(time) {
    if (this.players[this.socket.id]) {
      this.players[this.socket.id].updateMovement(time);
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
