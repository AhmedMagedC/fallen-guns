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
        end: 11,
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
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "idle left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_idle_left`, {
        start: 0,
        end: 10,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "jump right",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_jump_right`, {
        start: 0,
        end: 0,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "jump left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_jump_left`, {
        start: 0,
        end: 0,
      }),
      frameRate: 5,
      repeat: -1,
    });
  }
}
