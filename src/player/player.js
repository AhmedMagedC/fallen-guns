import { Anim } from "../animation/animation.js";

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, playerID, x, y, state, name, bulletTime, ammo, gunType) {
    super(scene, x, y);
    this.scene = scene;
    this.name = name;
    this.id = playerID;
    this.currentState = state;
    this.animation = new Anim(this.id, this.scene, this.name);
    this.bulletTime = bulletTime; // the time at which the bullet goes out of the gun (to sync with the animation)
    this.ammo = ammo;
    this.reshargedAmmo = ammo;
    this.gunType = gunType;
    this.init();
  }
  init() {
    this.speedX = 500;
    this.speedY = 420;
    this.animation.createAnim();
    this.scene.add.existing(this); // add player to the scene
    this.scene.physics.add.existing(this); // add physics to the player
    this.canDoubleJump = false; // to detect the player did only a one double jump
    this.fireSound = this.scene.sound.add(`${this.name}_gun_sound`); // sound of the gun
    this.body.setCollideWorldBounds(true);
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys({
      f: Phaser.Input.Keyboard.KeyCodes.F,
    });
    this.bulletIcon = []; // the icon of bullets at the top left of the scene
    this.createBulletsUI(); // to create these icons
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
        if (elapsedTime >= this.bulletTime && this.startAnimationtime) {
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
    if (!this.body.touching.down) {
      if (this.cursor.up.isDown && this.canDoubleJump) this.doubleJump();

      if (this.keys.f.isDown) this.Fire();
      else if (this.cursor.right.isDown) this.moveRightInAir();
      else if (this.cursor.left.isDown) this.moveLeftInAir();
      else this.idleInAir();
    } else {
      this.canDoubleJump = true;
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
    this.body.setVelocityX(this.speedX);
    this.currentState = "run right";
    this.playAnim("run right");
  }

  runLeft() {
    this.body.setVelocityX(-this.speedX);
    this.currentState = "run left";
    this.playAnim("run left");
  }

  jumpRight() {
    this.currentState = "jump right";
    this.body.setVelocityX(this.speedX);
    this.body.setVelocityY(-this.speedY);
    this.cursor.up.isDown = false; // necessary to play the first jump animation , without it double jump animation would be fired
  }

  jumpLeft() {
    this.currentState = "jump left";
    this.body.setVelocityX(-this.speedX);
    this.body.setVelocityY(-this.speedY);
    this.cursor.up.isDown = false;
  }

  jump() {
    this.currentState = `jump ${this.currentState.split(" ")[1]}`;
    this.body.setVelocityY(-this.speedY);
    this.cursor.up.isDown = false;
  }

  idle() {
    this.currentState = `idle ${this.currentState.split(" ")[1]}`;
    this.body.setVelocityX(0);
    this.playAnim(this.currentState);
  }

  doubleJump() {
    this.canDoubleJump = false;
    this.body.setVelocityY(-this.speedY);
    this.currentState = `dbljump ${this.currentState.split(" ")[1]}`;
  }

  moveRightInAir() {
    this.body.setVelocityX(this.speedX);
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump" // while in air , we either set and play jump or double jump animation
    } right`;
    this.playAnim(this.currentState);
  }

  moveLeftInAir() {
    this.body.setVelocityX(-this.speedX);
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump" // while in air , we either set and play jump or double jump animation
    } left`;
    this.playAnim(this.currentState);
  }

  idleInAir() {
    // being idle in air
    this.body.setVelocityX(0);
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump"
    } ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
  }

  Fire() {
    if (this.ammo <= 0) return;

    if (this.body.touching.down) this.body.setVelocityX(0); // only stops moving if your on the ground
    this.currentState = `shot ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
  }

  createBullet(x, y, velocityX) {
    this.ammo--;
    if (this.id == this.scene.socket.id) {
      this.bulletIcon[this.ammo + 1].destroy();
    }
    this.scene.socket.emit("createBullet", {
      // notify the server for the bullet just fired
      x: x,
      y: y,
      velocityX: velocityX,
      srcID: this.id,
    });
  }

  gotHit() {
    const bloodEmitter = this.scene.add.particles(
      // emit blood particles
      this.x,
      this.y + 15,
      "blood particle",
      {
        lifespan: 500,
        speed: { min: -300, max: 300 },
        scale: { start: 0.5, end: 0 },
      }
    );
    bloodEmitter.explode(3);
  }

  createBulletsUI() {
    if (this.id == this.scene.socket.id) {
      // create bullets icon for the main player only (the one that connected to the socket)
      let initX = 15;
      for (let bullet = 1; bullet <= this.ammo; bullet++) {
        if (this.bulletIcon[bullet]) this.bulletIcon[bullet].destroy();
        this.bulletIcon[bullet] = this.scene.add
          .image(initX, 10, `${this.gunType} ammo`)
          .setScale(1);

        initX += 25;
      }
    }
  }

  reshargeAmmo() {
    this.ammo = this.reshargedAmmo;
    this.createBulletsUI();
  }
}
