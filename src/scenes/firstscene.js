import { Player } from "../player/player.js";

export class FirstScene extends Phaser.Scene {
  constructor() {
    super({
      key: "firstscene",
    });
  }

  init(socket) {
    this.socket = socket;
  }
  preload() {}

  create() {
    this.ammoCrate = null;
    this.createBackGround();
    const grounds = [];
    this.createGrounds(grounds);

    this.players = {}; // Store all players

    this.socket.emit("inTheScene"); //inform the server the player just spawned into the scene

    // Listen for player data from the server
    this.socket.on("playerData", (players) => {
      Object.keys(players).forEach((id) => {
        if (!this.players[id]) {
          this.players[id] = new Player(
            this,
            id,
            players[id].charStats.character.name,
            players[id].charStats.character.bulletTime,
            players[id].charStats.character.ammo,
            players[id].charStats.character.gunType,
            players[id].charStats.character.numOfAnimationAttack,
            players[id].charStats.character.health,
            players[id].charStats.character.damage,
            players[id].charStats.character.damageRange
          );
          this.players[id].setScale(players[id].charStats.character.scale);
          this.players[id].body.setSize(
            // Adjust size for proper hitbox
            players[id].charStats.character.hitbox.sizeX,
            players[id].charStats.character.hitbox.sizeY
          );
          this.players[id].body.setOffset(45, 45); // Adjust Offset for proper hitbox
          grounds.forEach((ground) => {
            this.physics.add.collider(this.players[id], ground);
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
      // make all clients see the change of some client's movement
      this.players[data.id].setX(data.x);
      this.players[data.id].setY(data.y);
      this.players[data.id].body.setVelocityY(0); // if not for this line , (for some reason) it misses up with the player's rendering when the gravity pulls down the player
    });

    this.socket.on("syncState", (data) => {
      // make all clients see the change of some client's state (idle,Running,jumping....)
      if (this.players[data.id].isDead) return; // if the player is dead , dont play any animation

      this.players[data.id].playAnim(data.state);
      this.players[data.id].currentState = data.state;
    });

    this.socket.on("syncBullet", (newBullet) => {
      // make all clients see the bullet just fired
      const bullet = this.physics.add.image(newBullet.x, newBullet.y, "bullet");
      bullet.body.setVelocityX(newBullet.velocityX);
      bullet.body.setAllowGravity(false);
      this.players[newBullet.srcID].playFireSound(); // play the sound of the gun that initiated the bullet

      Object.keys(this.players).forEach((id) => {
        // Targets are everyone except the one who fired the bullet
        if (newBullet.srcID != id) {
          this.players[newBullet.srcID].targetedPlayer(
            this.players[id],
            bullet
          );
        }
      });
    });

    this.socket.on("createAmmoCrate", (posX) => {
      // respawns an ammo crate when the server says so
      this.ammoCrate = this.physics.add
        .sprite(posX, 0, "ammo crate")
        .setScale(0.15);

      this.ammoCrate.setAngularVelocity(500);
      this.ammoCrate.body.setAllowGravity(false); // disable global gravity to customize velocity 200
      this.ammoCrate.setVelocityY(200); // Lower gravity for slower falling

      this.physics.add.overlap(
        this.players[this.socket.id],
        this.ammoCrate,
        () => {
          this.socket.emit("destroyAllAmmoCrates"); // upon picking the ammo crate , tell the server to destroy all ammo crates in other client's scene
          this.players[this.socket.id].reshargeAmmo(); // resharge ammo for the main player only
        }
      );
    });

    this.socket.on("destroyAllAmmoCrates", () => {
      if (this.ammoCrate) this.ammoCrate.destroy();
    });
    this.scoreboard = this.add.container(200, 100); // Position it on the screen
    this.scoreboard.setAlpha(0); // Initially hidden

    // Add a background for the scoreboard
    const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.5).setOrigin(0);
    this.scoreboard.add(bg);

    // Add player names and scores
    const players = [
      { name: "Player1", score: 100 },
      { name: "Player2", score: 200 },
    ];

    players.forEach((player, index) => {
      const text = this.add.text(
        10,
        10 + index * 30,
        `${player.name}: ${player.score}`,
        {
          fontSize: "16px",
          fill: "#ffffff",
        }
      );
      this.scoreboard.add(text);
    });

    // Set up keyboard input
    const tabKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.TAB
    );

    // Fade in when Tab is pressed
    tabKey.on("down", () => {
      this.tweens.add({
        targets: this.scoreboard,
        alpha: 1,
        duration: 300, // Duration of fade in (in ms)
        ease: "Power1",
      });
    });

    // Fade out when Tab is released
    tabKey.on("up", () => {
      this.tweens.add({
        targets: this.scoreboard,
        alpha: 0,
        duration: 300, // Duration of fade out (in ms)
        ease: "Power1",
      });
    });
  }
  update() {
    if (this.players[this.socket.id]) {
      this.players[this.socket.id].updateMovement();
      this.players[this.socket.id].updateHealthPointsUI();

      let updatedState = this.players[this.socket.id].currentState;

      this.socket.emit("updateState", {
        // inform the server for the updated animation state
        id: this.socket.id,
        state: updatedState,
      });

      this.socket.emit("updatePosition", {
        // infron the server for the updated position
        x: this.players[this.socket.id].x,
        y: this.players[this.socket.id].y,
        id: this.socket.id,
      });

      Object.keys(this.players).forEach((id) => {
        // detect if any one fallen out of boundries
        if (this.players[id].y > 650)
          this.players[id].damagePlayer(
            // when falling -> act as if he got hit by an inf damage
            this.players[id],
            Number.MAX_VALUE
          );
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
