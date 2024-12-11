import { Anim } from "../animation/animation.js";

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, playerID, x, y, state, name, fireCooldown) {
    super(scene, x, y);
    this.scene = scene;
    this.name = name;
    this.id = playerID;
    this.currentState = state;
    this.animation = new Anim(this.id, this.scene, this.name);
    this.fireCooldown = fireCooldown; // cooldown between shots
    this.init();
  }
  init() {
    this.animation.createAnim();
    this.scene.add.existing(this); // add player to the scene
    this.scene.physics.add.existing(this); // add physics to the player
    this.isDoubleJumped = false; // to detect the player did only a one double jump
    this.fireSound = this.scene.sound.add(`${this.name}_gun_sound`); // sound of the gun
    this.body.setCollideWorldBounds(true);
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys({
      f: Phaser.Input.Keyboard.KeyCodes.F,
    });

    this.on("animationstart", (animation) => {
      // get the timestap of the fire animation

      if (
        animation.key.split(" ")[1] == "shot" &&
        this.scene.socket.id == this.id
      )
        this.startAnimationtime = this.scene.time.now;
    });

    this.on("animationupdate", (animation) => {
      // to apply the cooldown between shots
      const elapsedTime = this.scene.time.now - this.startAnimationtime;
      if (animation.key.split(" ")[1] == "shot") {
        if (elapsedTime >= this.fireCooldown && this.startAnimationtime) {
          const facingLeft = this.currentState.split(" ")[1] == "left" ? -1 : 1; //direction determination
          this.startAnimationtime = null;

          this.createBullet(
            // dont create a bullet if it's the shotgun player (Raider_1) (make the bullet go out of boundries)
            this.name != "Raider_1" ? this.x + 20 * facingLeft : facingLeft, // adjust the bullet init position (so it looks as if it's coming out from the gun)
            this.name != "Raider_1"
              ? this.y + (this.name == "Gangsters_2" ? 10 : 25)
              : -1,
            2000 * facingLeft
          );
        }
      }
    });
  }
  updateMovement() {
    if (
      this.anims.isPlaying &&
      this.anims.currentAnim.key.split(" ")[1] === "hurt"
    )
      return; //if its the hurt animation then it must finish playing first before any other animation
    if (!this.body.touching.down) {
      if (this.cursor.up.isDown && this.isDoubleJumped) this.doubleJump();

      if (this.cursor.right.isDown) this.moveRightInAir();
      else if (this.cursor.left.isDown) this.moveLeftInAir();
      else this.idleInAir();

      this.playAnim(this.currentState);
    } else {
      this.isDoubleJumped = true;
      if (this.keys.f.isDown) this.Fire();
      else if (this.cursor.right.isDown) {
        if (this.cursor.up.isDown) this.jumpRight();
        else this.runRight();
      } else if (this.cursor.left.isDown) {
        if (this.cursor.up.isDown) this.jumpLeft();
        else this.runLeft();
      } else if (this.cursor.up.isDown) this.jump();
      else this.idle();
    }
  }

  playAnim(key) {
    this.anims.play(`${this.id} ${key}`, true);
  }

  runRight() {
    this.body.setVelocityX(400);
    this.currentState = "run right";
    this.playAnim("run right");
  }

  runLeft() {
    this.body.setVelocityX(-400);
    this.currentState = "run left";
    this.playAnim("run left");
  }

  jumpRight() {
    this.currentState = "jump right";
    this.body.setVelocityX(400);
    this.body.setVelocityY(-300);
    this.cursor.up.isDown = false; // necessary to play the first jump animation , without it double jump animation would be fired
  }

  jumpLeft() {
    this.currentState = "jump left";
    this.body.setVelocityX(-400);
    this.body.setVelocityY(-300);
    this.cursor.up.isDown = false;
  }

  jump() {
    this.currentState = `jump ${this.currentState.split(" ")[1]}`;
    this.body.setVelocityY(-300);
    this.cursor.up.isDown = false;
  }

  idle() {
    this.currentState = `idle ${this.currentState.split(" ")[1]}`;
    this.body.setVelocityX(0);
    this.playAnim(this.currentState);
  }

  doubleJump() {
    this.isDoubleJumped = false;
    this.body.setVelocityY(-300);
    this.currentState = `dbljump ${this.currentState.split(" ")[1]}`;
  }

  moveRightInAir() {
    this.body.setVelocityX(400);
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump" // while in air , we either set and play jump or double jump animation
    } right`;
  }

  moveLeftInAir() {
    this.body.setVelocityX(-400);
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump" // while in air , we either set and play jump or double jump animation
    } left`;
  }

  idleInAir() {
    // being idle in air
    this.body.setVelocityX(0);
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump"
    } ${this.currentState.split(" ")[1]}`;
  }

  Fire() {
    this.body.setVelocityX(0);
    this.currentState = `shot ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
  }

  createBullet(x, y, velocityX) {
    this.scene.socket.emit("createBullet", {
      // notify the server for the bullet just fired
      x: x,
      y: y,
      velocityX: velocityX,
      srcID: this.id,
    });
  }

  gotHit() {
    this.currentState = `hurt ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
  }
}
