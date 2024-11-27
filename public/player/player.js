export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, "ninja");
    this.scene = scene;
    this.name = name;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.init();
  }
  init() {
    this.body.setCollideWorldBounds(true);
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.scene.anims.create({
      key: "run",
      frames: this.scene.anims.generateFrameNumbers("run", {
        start: 0,
        end: 11,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "idle",
      frames: this.scene.anims.generateFrameNumbers("ninja", {
        start: 0,
        end: 10,
      }),
      frameRate: 20,
      repeat: -1,
    });
  }
  update() {
    if (this.cursor.left.isDown) {
      this.body.setVelocityX(-400);
      this.anims.play("run", true);
    } else if (this.cursor.right.isDown) {
      this.body.setVelocityX(400);
      this.anims.play("run", true);
    } else {
      this.body.setVelocityX(0);
      this.anims.play("idle", true);
      return false;
    }
    return true;
  }

  playAnim(){
    this.anims.play("run", true);
  }
}
