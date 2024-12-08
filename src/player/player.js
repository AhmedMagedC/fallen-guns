import { Anim } from "../animation/animation.js";

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, state, name) {
    super(scene, x, y);
    this.scene = scene;
    this.name = name;
    this.currentState = state;
    this.animation = new Anim(this.scene, this.name);
    scene.add.existing(this); // add player to the scene
    scene.physics.add.existing(this); // add physics to the player
    this.doubleJump = false; // to detect the player did only a one double jump
    this.fireCooldown = 500; // 500ms cooldown between shots
    this.lastFireTime = 0; // Timestamp of the last fire
    this.fireSound = this.scene.sound.add("fire_sound");
    this.init();
  }
  init() {
    this.body.setCollideWorldBounds(true);
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys({
      f: Phaser.Input.Keyboard.KeyCodes.F,
    });
    this.animation.createAnim();
  }
  updateMovement(time) {
    if (
      this.anims.currentAnim.key.split(" ")[0] === "hurt" &&
      this.anims.isPlaying
    )
      return; //if its the hurt animation then it must finish playing first before any other animation
    if (!this.body.touching.down) {
      if (this.cursor.up.isDown && this.doubleJump) {
        this.doubleJump = false;
        this.body.setVelocityY(-300);
        this.currentState = `dbljump ${this.currentState.split(" ")[1]}`;
      }
      if (this.cursor.right.isDown) {
        this.body.setVelocityX(400);
        this.currentState = `${
          this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump" // while in air , we either set and play jump or double jump animation
        } right`;
      } else if (this.cursor.left.isDown) {
        this.body.setVelocityX(-400);
        this.currentState = `${
          this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump"
        } left`;
      } else {
        // being idle in air
        this.body.setVelocityX(0);
        this.currentState = `${
          this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump"
        } ${this.currentState.split(" ")[1]}`;
      }
      this.playAnim(this.currentState);
    } else {
      this.doubleJump = true;
      if (this.keys.f.isDown) this.Fire(time);
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
    this.anims.play(key, true);
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

  Fire(time) {
    this.body.setVelocityX(0);
    this.currentState = `shot ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
    if (time - this.lastFireTime > this.fireCooldown) {
      const facingLeft = this.currentState.split(" ")[1] == "left" ? -1 : 1; //if facing left, make the velocity negative
      this.createBullet(
        this.x + 25 * facingLeft, // adjust the bullet init position (so it looks as if it's coming out from the gun)
        this.y + 25,
        2000 * facingLeft
      );
      this.fireSound.play();
      this.lastFireTime = time;
    }
  }

  createBullet(x, y, velocityX) {
    this.scene.socket.emit("createBullet", {
      // notify the server for the bullet just fired
      x: x,
      y: y,
      velocityX: velocityX,
      srcID: this.scene.socket.id,
    });
  }

  gotHit() {
    this.currentState = `hurt ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
  }
}
