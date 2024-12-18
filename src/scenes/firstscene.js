import { Player } from "../player/player.js";

export class FirstScene extends Phaser.Scene {
  constructor() {
    super({
      key: "firstscene",
    });
  }

  preload() {}

  create() {
    this.createBackGround();
    const grounds = [];
    this.createGrounds(grounds);

    this.players = {}; // Store all players

    const charStats = JSON.stringify(this.scene.settings.data.charStats);
    this.socket = io({
      query: {
        charStats,
      },
    }); // Connect to the server

    // Listen for player data from the server
    this.socket.on("playerData", (players) => {
      Object.keys(players).forEach((id) => {
        if (!this.players[id]) {
          const { x, y } = players[id];
          const currentState = players[id].state;
          this.players[id] = new Player(
            this,
            id,
            x,
            y,
            currentState,
            players[id].charStats.name,
            players[id].charStats.bulletTime,
            players[id].charStats.ammo,
            players[id].charStats.gunType,
            players[id].charStats.numOfAnimationAttack
          );
          this.players[id].setScale(players[id].charStats.scale);
          this.players[id].body.setSize(
            // Adjust size for proper hitbox
            players[id].charStats.hitbox.sizeX,
            players[id].charStats.hitbox.sizeY
          );
          this.players[id].body.setOffset(45,45); // Adjust Offset for proper hitbox
          this.players[id].updateHealthPointsUI(players[id].charStats.health); // at first join , create health points at the top right corner (only for the main player (the one that initiate the socket connection))
          this.players[id].playAnim(currentState);
          grounds.forEach((ground) => {
            this.physics.add.collider(this.players[id], ground);
          });
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
        // dont repeat the animation , except for the shooting one
        (data.id != this.socket.id &&
          data.state != this.players[data.id].currentState) ||
        (data.id != this.socket.id && data.state.split(" ")[0] == "shot")
      ) {
        this.players[data.id].playAnim(data.state);
        this.players[data.id].currentState = data.state;
      }
    });
    this.socket.on("syncBullet", (newBullet) => {
      const bullet = this.physics.add.image(newBullet.x, newBullet.y, "bullet");
      bullet.body.setVelocityX(newBullet.velocityX);
      bullet.body.setAllowGravity(false);
      this.players[newBullet.srcID].playFireSound();

      Object.keys(this.players).forEach((id) => {
        if (newBullet.y == -1 && newBullet.srcID != id) {
          // dont create a bullet if it's the shotgun player (make the bullet go out of boundries), instead collide if the enemey is 110m(x-axis) && 50m(y-axis) far from the player
          const xDistanceFromSrcPlayer =
            this.players[id].x - this.players[newBullet.srcID].x;
          const yDistanceFromSrcPlayer =
            this.players[id].y - this.players[newBullet.srcID].y;
          if (
            xDistanceFromSrcPlayer * newBullet.x >= 0 && //newBullet.x to determine the direction of the gun
            xDistanceFromSrcPlayer * newBullet.x <= 110 &&
            Math.abs(yDistanceFromSrcPlayer) <= 50
          ) {
            this.players[id].gotHit();

            bullet.destroy();

            if (this.socket.id == newBullet.srcID)
              // necessary to make the player who got hit to lose only a single point of health
              this.socket.emit("playerGotHit", id, newBullet.srcID); // update the player's health
          }
        } else if (newBullet.srcID != id) {
          // make bullet collides with all players ,except the one who fired it
          this.physics.add.overlap(this.players[id], bullet, () => {
            this.players[id].gotHit();

            bullet.destroy();

            if (this.socket.id == newBullet.srcID)
              // necessary to make the player who got hit to lose only a single point of health
              this.socket.emit("playerGotHit", id, newBullet.srcID); // update the player's health
          });
        }
      });
    });

    this.socket.on("playerGotHitSync", (id, curHealth) => {
      this.players[id].updateHealthPointsUI(curHealth);
      if (curHealth <= 0) this.players[id].destroy();
    });

    this.socket.on("createAmmoCrate", (posX) => {
      // respawns an ammo crate when the server says so
      const ammoCrate = this.physics.add
        .sprite(posX, 0, "ammo crate")
        .setScale(0.15);

      ammoCrate.setAngularVelocity(500);
      ammoCrate.body.setAllowGravity(false); // disable global gravity to customize velocity 200
      ammoCrate.setVelocityY(200); // Lower gravity for slower falling

      Object.keys(this.players).forEach((id) => {
        // make crate overlap with players
        this.physics.add.overlap(this.players[id], ammoCrate, () => {
          ammoCrate.destroy();

          if (id == this.socket.id) this.players[id].reshargeAmmo(); // resharge ammo for the main player only
        });
      });
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
  createBackGround() {
    const background = this.add.image(0, 0, "sky forest");

    background.setOrigin(0, 0.4);
    let scaleX = this.scale.width / background.width; // Scale based on screen width
    let scaleY = this.scale.height / background.height; // Scale based on screen height
    let scale = Math.max(scaleX, scaleY * 1.9); // Use the larger scale to cover the entire screen

    background.setScale(scale);
  }
  createGrounds(grounds) {
    grounds[0] = this.physics.add
      .staticImage(0, 250, "green ground")
      .setScale(0.06)
      .refreshBody();

    grounds[1] = this.physics.add
      .staticImage(this.scale.width, 250, "green ground")
      .setScale(0.07)
      .refreshBody();

    grounds[2] = this.physics.add
      .staticImage(this.scale.width / 2, 450, "green ground")
      .setScale(0.17, 0.07)
      .refreshBody();
  }
}
