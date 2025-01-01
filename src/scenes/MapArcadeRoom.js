import { Player } from "../player/player.js";

export class MapArcadeRoom extends Phaser.Scene {
  constructor() {
    super({
      key: "MapArcadeRoom",
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

    this.gameFinished = false;

    this.players = {}; // Store all players

    this.socket.emit("inTheScene"); //inform the server the player just spawned into the scene

    // Listen for player data from the server
    this.socket.on("playerData", (players, maxKills) => {
      this.maxKills = maxKills;
      players.forEach((player) => {
        const id = player.id;
        const charStats = player.charStats;
        const playerName = player.playerName;

        if (!this.players[id]) {
          this.players[id] = new Player(
            this,
            id,
            playerName,
            charStats.name,
            charStats.bulletTime,
            charStats.ammo,
            charStats.gunType,
            charStats.numOfAnimationAttack,
            charStats.health,
            charStats.damage,
            charStats.damageRange
          );
          this.players[id].setScale(charStats.scale);
          this.players[id].body.setSize(
            // Adjust size for proper hitbox
            charStats.hitbox.sizeX,
            charStats.hitbox.sizeY
          );
          this.players[id].body.setOffset(55, 45); // Adjust Offset for proper hitbox
          grounds.forEach((ground) => {
            this.physics.add.collider(this.players[id], ground);
          });
        }
      });
    });

    this.socket.on("removePlayer", (id) => {
      if (this.players[id]) {
        if (this.players[id].textName) this.players[id].textName.destroy();
        this.players[id].destroy();
        delete this.players[id];
      }
    });

    this.socket.on("syncPosition", (data) => {
      // make all clients see the change of some client's movement
      if (data.id == this.socket.id) return;

      this.players[data.id].setX(data.x);
      this.players[data.id].setY(data.y);
      this.players[data.id].body.setVelocityY(0); // if not for this line , (for some reason) it misses up with the player's rendering when the gravity pulls down the player
    });

    this.socket.on("syncState", (data) => {
      // make all clients see the change of some client's state (idle,Running,jumping....)
      if (data.id == this.socket.id) return;
      if (this.players[data.id].isDead) return; // if the player is dead , dont play any animation

      this.players[data.id].playAnim(data.state);
      this.players[data.id].currentState = data.state;
    });

    this.socket.on("syncBullet", (newBullet) => {
      // make all clients see the bullet just fired
      const bullet = this.physics.add.image(newBullet.x, newBullet.y, "bullet");
      bullet.setScale(1.6);
      bullet.body.setVelocityX(newBullet.velocityX);
      bullet.body.setAllowGravity(false);
      this.players[newBullet.srcID].playFireSound(); // play the sound of the gun that initiated the bullet

      Object.keys(this.players).forEach((id) => {
        // Targets are everyone except the one who fired the bullet
        if (newBullet.srcID != id) {
          this.players[newBullet.srcID].targetedPlayer(
            this.players[id],
            newBullet.srcID,
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

    this.socket.on("playerGotKilled", (id, killerID) => {
      if (this.players[id].isDead) return;

      this.players[id].died();

      if (killerID == -1) this.players[id].score--;
      // it means the player jumped of the cliff , so decrease a point of him
      else this.players[killerID].score++;
    });

    this.socket.on("revivePlayer", (id) => {
      this.players[id].revive();
    });

    this.createScoreBoard();
  }
  update() {
    if (this.players[this.socket.id]) {
      this.updateScoreBoard(this.maxKills);
      this.players[this.socket.id].updateMovement();
      this.players[this.socket.id].updateHealthPointsUI();
      this.displayNames();

      let updatedState = this.players[this.socket.id].currentState;

      this.socket.emit("updateState", {
        // inform the server for the updated animation state && health
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
        if (this.players[id].y > this.scale.height - 100)
          this.players[id].damagePlayer(
            // when falling -> act as if he got hit by an inf damage
            this.players[id],
            -1,
            Number.MAX_VALUE
          );
      });

      if (
        this.players[this.socket.id].score >= this.maxKills &&
        !this.gameFinished
      ) {
        this.gameFinished = true; // indicate the game had finished once any player won
        this.socket.emit(
          "playerWon",
          this.players[this.socket.id].playerName,
          this.socket.id
        );
      }
    }
  }
  displayNames() {
    Object.keys(this.players).forEach((id) => {
      if (this.players[id].textName) this.players[id].textName.destroy();
      this.players[id].textName = this.add.text(
        this.players[id].x,
        this.players[id].y - 50,
        this.players[id].playerName,
        {
          font: "16px Arial",
          fill: "#ffffff", // White text color
          backgroundColor: "#000000", // Black background
          padding: { x: 5, y: 2 }, // Padding for better visibility
        }
      );
      this.players[id].textName.setOrigin(0.5); // Center the text horizontally
    });
  }
  createBackGround() {
    // Create the background image
    const background = this.add.image(0, 0, "arcade room");

    background.setOrigin(0, 0);
    let scaleX = this.scale.width / background.width; // Scale based on screen width
    let scaleY = this.scale.height / background.height; // Scale based on screen height
    let scale = Math.max(scaleX, scaleY); // Use the larger scale to cover the entire screen

    background.setScale(scale);
  }

  createGrounds(grounds) {
    grounds[0] = this.physics.add
      .staticImage(0, 250, "black ground")
      .setScale(0.09)
      .refreshBody();

    grounds[1] = this.physics.add
      .staticImage(this.scale.width, 250, "black ground")
      .setScale(0.09)
      .refreshBody();

    grounds[2] = this.physics.add
      .staticImage(this.scale.width / 2, 500, "black ground")
      .setScale(0.19, 0.09)
      .refreshBody();

    grounds[3] = this.physics.add
      .staticImage(0, 750, "black ground")
      .setScale(0.09)
      .refreshBody();

    grounds[5] = this.physics.add
      .staticImage(this.scale.width, 750, "black ground")
      .setScale(0.09)
      .refreshBody();
  }

  createScoreBoard() {
    this.scoreboard = this.add.container(500, 100); // Position it on the screen
    this.scoreboard.setAlpha(0); // Initially hidden

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

  updateScoreBoard(maxKillsToWin) {
    // Clear the previous scoreboard contents
    this.scoreboard.removeAll(true); // Remove all children and destroy them

    // Calculate the dynamic size of the scoreboard
    const padding = 20; // Padding around the text
    const lineHeight = 30; // Height of each line
    const contentWidth = 620; // Fixed width for the scoreboard
    const contentHeight =
      padding * 2 + lineHeight * (1 + Object.keys(this.players).length); // Height includes title + player list

    // Get the center of the scene
    const centerX = 0;
    const centerY = 0;

    // Create and position the background rectangle
    const bg = this.add
      .rectangle(
        centerX, // Center horizontally
        centerY, // Center vertically
        contentWidth, // Dynamic width
        contentHeight, // Dynamic height
        0x1e1e1e, // Dark gray background
        0.6 // Slight transparency
      )
      .setOrigin(0.5); // Center the rectangle

    this.scoreboard.add(bg);

    // Add the "Max kills to win" title at the top
    const title = this.add.text(
      centerX - contentWidth / 2 + padding, // Align text to the left inside the background
      centerY - contentHeight / 2 + padding, // Start at the top of the background
      `\t\t\t Max kills to win: ${maxKillsToWin}`,
      {
        fontSize: "18px",
        fill: "#ffffff", // White color for the title
        fontStyle: "bold",
      }
    );
    this.scoreboard.add(title);

    // Start adding player scores below the title
    let initY = centerY - contentHeight / 2 + padding + lineHeight; // Start below the title
    Object.keys(this.players).forEach((id) => {
      const isClient = id === this.socket.id; // Check if this is the client's score
      const playerName = this.players[id].playerName;
      const score = this.players[id].score;

      // Create the text object for the player's score
      const text = this.add.text(
        centerX - contentWidth / 2 + padding, // Align text to the left inside the background
        initY, // Y position
        `name: ${playerName} \t\t\t score: ${score}\t\t\t id: ${id}`, // Player name and score
        {
          fontSize: "16px",
          fill: isClient ? "#00ff00" : "#ffffff", // Green for the client, white for others
          fontStyle: isClient ? "bold" : "normal",
        }
      );

      // Add a green highlight for the client's score
      if (isClient) {
        const highlightBg = this.add.rectangle(
          text.x + text.width / 2, // Center the rectangle behind the text
          text.y + text.height / 2, // Center vertically
          text.width + 10, // Add some padding
          text.height, // Match text height
          0x004400, // Dark green background
          0.7 // Opacity
        );
        highlightBg.setOrigin(0.5);
        this.scoreboard.add(highlightBg); // Add the background to the scoreboard container
      }

      this.scoreboard.add(text);
      initY += lineHeight; // Move down for the next player
    });
  }
}