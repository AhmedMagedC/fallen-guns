/* 
Anim class is used to create different animations for different states for each player 
(idle , running right , running left , jumping right , .... etc)
it's determined by using <characterName>_<state>_<facingRightOrLeft>
*/

// animations are preloaded in bootloader.js

export class Anim {
  constructor(scene, gameObjName) {
    this.name = gameObjName;
    this.scene = scene;
  }

  createAnim() {
    this.scene.anims.create({
      key: "run right",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_run_right`, {
        start: 0,
        end: 10,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "run left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_run_left`, {
        start: 0,
        end: 11,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "idle right",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_idle_right`, {
        start: 0,
        end: 10,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "idle left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_idle_left`, {
        start: 0,
        end: 10,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "jump right",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_jump_right`, {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: "jump left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_jump_left`, {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: "dbljump right",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_dbljump_right`, {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: "dbljump left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_dbljump_left`, {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: "shot left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_shot_left`, {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "shot right",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_shot_right`, {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
