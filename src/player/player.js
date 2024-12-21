import { Anim } from "../animation/animation.js";

export class Player extends Phaser.GameObjects.Sprite {
  constructor(
    scene,
    playerID,
    x,
    y,
    state,
    name,
    bulletTime,
    ammo,
    gunType,
    numOfAttacks
  ) {
    super(scene, x, y);
    this.scene = scene;
    this.name = name;
    this.id = playerID;
    this.currentState = state;
    this.animation = new Anim(this.id, this.scene, this.name, numOfAttacks);
    this.bulletTime = bulletTime; // the time at which the bullet goes out of the gun (to sync with the animation)
    this.ammo = ammo;
    this.reshargedAmmo = ammo;
    this.gunType = gunType;
    this.numOfAttacks = numOfAttacks; //number of animation attacks
    this.attackIndx = 0;
    this.init();
  }
  init() {
    this.speedX = 500;
    this.speedY = 420;
    this.isDead = false;
    this.animation.createAnim();
    this.scene.add.existing(this); // add player to the scene
    this.scene.physics.add.existing(this); // add physics to the player
    this.canDoubleJump = false; // to detect the player did only a one double jump
    this.fireSound = []; // sound of the gun
    for (let sound = 0; sound < this.numOfAttacks; sound++) {
      this.fireSound[sound] = this.scene.sound.add(
        `${this.name}_gun_sound_${sound}`
      );
    }
    this.body.setCollideWorldBounds(true);
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.keys = this.scene.input.keyboard.addKeys({
      f: Phaser.Input.Keyboard.KeyCodes.F,
    });
    this.bulletIcon = []; // the icon of bullets at the top left of the scene
    this.createBulletsUI(); // to create these icons
    this.healthPointsIcon = []; // the icon of health points at the top right of the scene
    this.on("animationstart", (animation) => {
      // get the timestap of the fire animation

      if (
        animation.key.split(" ")[1] == "shot" &&
        this.scene.socket.id == this.id
      )
        this.startAnimationtime = this.scene.time.now;
    });

    this.on("animationupdate", (animation) => {
      // to sync the shooting animation with bullet && gun sound
      const elapsedTime = this.scene.time.now - this.startAnimationtime;
      if (animation.key.split(" ")[1] == "shot") {
        if (elapsedTime >= this.bulletTime && this.startAnimationtime) {
          const facingLeft = this.currentState.split(" ")[1] == "left" ? -1 : 1; //direction determination
          this.startAnimationtime = null;

          const bulletX = this.canCreateBullet() // dont create a bullet if it's the shotgun player or sword player (make the bullet go out of boundries)
            ? this.x + 20 * facingLeft
            : facingLeft;
          const bulletY = this.canCreateBullet()
            ? this.y + (this.gunType == "pistol" ? 10 : 25) // some special handling for the pistol player (to make the bullet as if it comes from the gun)
            : -1;
          const bulletVelocity = 2000 * facingLeft;

          this.createBullet(bulletX, bulletY, bulletVelocity);
        }
      }
    });
    this.on("animationcomplete", (animation) => {
      if (
        animation.key.split(" ")[1] == "shot" &&
        this.scene.socket.id == this.id
      )
        this.attackIndx = (this.attackIndx + 1) % this.numOfAttacks; // apply the next attack && sound
    });
  }
  updateMovement() {
    if (this.isDead) return; //don't make any move if you're dead
    if (this.keys.f.isDown) this.Fire();

    if (!this.body.touching.down) {
      if (this.cursor.up.isDown && this.canDoubleJump) this.doubleJump();

      if (this.cursor.right.isDown) this.moveRightInAir();
      else if (this.cursor.left.isDown) this.moveLeftInAir();
      else this.idleInAir();
    } else {
      this.canDoubleJump = true;
      if (this.cursor.right.isDown) {
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
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot right ${this.attackIndx}`;
      return;
    }
    this.currentState = "run right";
    this.playAnim("run right");
  }

  runLeft() {
    this.body.setVelocityX(-this.speedX);
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot left ${this.attackIndx}`;
      return;
    }
    this.currentState = "run left";
    this.playAnim("run left");
  }

  jumpRight() {
    this.body.setVelocityX(this.speedX);
    this.body.setVelocityY(-this.speedY);
    this.cursor.up.isDown = false; // necessary to play the first jump animation , without it double jump animation would be fired
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot right ${this.attackIndx}`;
      return;
    }
    this.currentState = "jump right";
  }

  jumpLeft() {
    this.body.setVelocityX(-this.speedX);
    this.body.setVelocityY(-this.speedY);
    this.cursor.up.isDown = false;
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot left ${this.attackIndx}`;
      return;
    }
    this.currentState = "jump left";
  }

  jump() {
    this.body.setVelocityY(-this.speedY);
    this.cursor.up.isDown = false;
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot ${this.currentState.split(" ")[1]} ${
        this.attackIndx
      }`;
      return;
    }
    this.currentState = `jump ${this.currentState.split(" ")[1]}`;
  }

  idle() {
    this.body.setVelocityX(0);
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot ${this.currentState.split(" ")[1]} ${
        this.attackIndx
      }`;
      return;
    }
    this.currentState = `idle ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
  }

  doubleJump() {
    this.body.setVelocityY(-this.speedY);
    this.canDoubleJump = false;
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot ${this.currentState.split(" ")[1]} ${
        this.attackIndx
      }`;
      return;
    }
    this.currentState = `dbljump ${this.currentState.split(" ")[1]}`;
  }

  moveRightInAir() {
    this.body.setVelocityX(this.speedX);
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot right ${this.attackIndx}`;
      return;
    }
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump" // while in air , we either set and play jump or double jump animation
    } right`;
    this.playAnim(this.currentState);
  }

  moveLeftInAir() {
    this.body.setVelocityX(-this.speedX);
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot left ${this.attackIndx}`;
      return;
    }
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump" // while in air , we either set and play jump or double jump animation
    } left`;
    this.playAnim(this.currentState);
  }

  idleInAir() {
    // being idle in air
    this.body.setVelocityX(0);
    if (this.keys.f.isDown) {
      // priority for the shoot animation first
      this.currentState = `shot ${this.currentState.split(" ")[1]} ${
        this.attackIndx
      }`;
      return;
    }
    this.currentState = `${
      this.currentState.split(" ")[0] == "dbljump" ? "dbljump" : "jump"
    } ${this.currentState.split(" ")[1]}`;
    this.playAnim(this.currentState);
  }

  Fire() {
    if (this.ammo <= 0) {
      this.keys.f.isDown = false;
      this.keys.f.enabled = false; //unable the user to press F incase of no ammo
      return;
    }

    this.currentState = `shot ${this.currentState.split(" ")[1]} ${
      this.attackIndx
    }`;
    this.playAnim(this.currentState);
  }

  playFireSound() {
    this.fireSound[this.attackIndx].play();
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

  emitBlood() {
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
          .image(initX, 20, `${this.gunType} ammo`)
          .setScale(1);

        initX += 25;
      }
    }
  }

  reshargeAmmo() {
    this.keys.f.enabled = true;
    this.ammo = this.reshargedAmmo;
    this.createBulletsUI();
  }

  updateHealthPointsUI(health) {
    this.healthPointsIcon.forEach((h) => h.destroy()); // clear health icons first

    let initX = this.scene.scale.width - 15;
    for (let h = 1; h <= health; h++) {
      this.healthPointsIcon[h] = this.scene.add
        .image(initX, 20, `health crate`)
        .setScale(1);

      initX -= 25;
    }
  }

  canCreateBullet() {
    return !(this.gunType == "sword" || this.gunType == "shotgun");
  }

  died() {
    this.currentState = `dead ${this.currentState.split(" ")[1]}`;
    this.isDead = true;
    this.playAnim(this.currentState);
  }

  revive() {
    this.currentState = `idle right`; //init state when revived
    this.isDead = false;
    this.reshargeAmmo();
    this.setX(Math.random() * 1500); 
    this.setY(Math.random() * -1);
  }
}
