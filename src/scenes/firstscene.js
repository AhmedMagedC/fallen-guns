import { Player } from "../player/player.js";

export class FirstScene extends Phaser.Scene {
  constructor() {
    super({
      key: "firstscene",
    });
  }

  

  preload() {}

  create() {
    this.ammoCrate = null;
    this.createBackGround();
    const grounds = [];
    this.createGrounds(grounds);
    console.log("in first scene");
    
    this.players = {}; // Store all players

    // Get charStats passed from the lobby scene without stringifying
    const charStats = this.scene.settings.data.charStats;

    // Ensure socket is passed from lobby scene if not initialized
    this.socket = io();  // Assuming the socket is passed via `data`
    console.log(this.socket);
    // this.socket.emit("hello")
    // Listen for player data from the server
    this.socket.on("playerData", (players) => {
      console.log(players);
      Object.keys(players).forEach((id) => {
        console.log(players[id]);
        if (!this.players[id]) {
          this.players[id] = new Player(
            this,
            id,
            players[id].charStats.name,
            players[id].charStats.bulletTime,
            players[id].charStats.ammo,
            players[id].charStats.gunType,
            players[id].charStats.numOfAnimationAttack,
            players[id].charStats.health,
            players[id].charStats.damage,
            players[id].charStats.damageRange
          );
          console.log(this);
          
          this.players[id].setScale(players[id].charStats.scale);
          this.players[id].body.setSize(
            players[id].charStats.hitbox.sizeX,
            players[id].charStats.hitbox.sizeY
          );
          this.players[id].body.setOffset(45, 45); // Adjust Offset for proper hitbox
          grounds.forEach((ground) => {
            this.physics.add.collider(this.players[id], ground);
          console.log("grounds");
          });
        }
      });
    });

    this.socket.on("removePlayer", (players) => {
      Object.keys(this.players).forEach((id) => {
        if (!players[id]) this.players[id].destroy();
      });
    });

    this.socket.on("syncPosition", (data) => {
      this.players[data.id].setX(data.x);
      this.players[data.id].setY(data.y);
      this.players[data.id].body.setVelocityY(0); // Fix rendering issue
    });

    this.socket.on("syncState", (data) => {
      if (this.players[data.id].isDead) return; // Don't play animation if dead
      this.players[data.id].playAnim(data.state);
      this.players[data.id].currentState = data.state;
    });

    this.socket.on("syncBullet", (newBullet) => {
      const bullet = this.physics.add.image(newBullet.x, newBullet.y, "bullet");
      bullet.body.setVelocityX(newBullet.velocityX);
      bullet.body.setAllowGravity(false);
      this.players[newBullet.srcID].playFireSound();

      Object.keys(this.players).forEach((id) => {
        if (newBullet.srcID !== id) {
          this.players[newBullet.srcID].targetedPlayer(this.players[id], bullet);
        }
      });
    });

    this.socket.on("createAmmoCrate", (posX) => {
      this.ammoCrate = this.physics.add.sprite(posX, 0, "ammo crate").setScale(0.15);
      this.ammoCrate.setAngularVelocity(500);
      this.ammoCrate.body.setAllowGravity(false);
      this.ammoCrate.setVelocityY(200);

      this.physics.add.overlap(
        this.players[this.socket.id],
        this.ammoCrate,
        () => {
          this.socket.emit("destroyAllAmmoCrates");
          this.players[this.socket.id].reshargeAmmo();
        }
      );
    });

    this.socket.on("destroyAllAmmoCrates", () => {
      if (this.ammoCrate) this.ammoCrate.destroy();
    });
  }
  update() {
    if (this.players[this.socket.id]) {
      this.players[this.socket.id].updateMovement();
      this.players[this.socket.id].updateHealthPointsUI();

      let updatedState = this.players[this.socket.id].currentState;

      // Emit updated state and position
      this.socket.emit("updateState", {
        id: this.socket.id,
        state: updatedState,
      });

      this.socket.emit("updatePosition", {
        x: this.players[this.socket.id].x,
        y: this.players[this.socket.id].y,
        id: this.socket.id,
      });

      // Check for players falling out of bounds
      Object.keys(this.players).forEach((id) => {
        if (this.players[id].y > this.scale.height)
          this.players[id].damagePlayer(this.players[id], Number.MAX_VALUE);
      });
    }
  }

  createBackGround() {
    const background = this.add.image(0, 0, "sky forest");
    background.setOrigin(0, 0.4);
    let scaleX = this.scale.width / background.width;
    let scaleY = this.scale.height / background.height;
    let scale = Math.max(scaleX, scaleY * 1.9);
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
