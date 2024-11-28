export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, `${name}_idle`);
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
      key: "right",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_right`, {
        start: 0,
        end: 11,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "left",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_left`, {
        start: 0,
        end: 11,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: "idle",
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_idle`, {
        start: 0,
        end: 10,
      }),
      frameRate: 20,
      repeat: -1,
    });
  }
  updateMovement() {
    if (this.cursor.left.isDown) {
      this.body.setVelocityX(-400);
      this.playAnim("left");
      return "left";
    } else if (this.cursor.right.isDown) {
      this.body.setVelocityX(400);
      this.playAnim("right");
      return "right";
    } else {
      this.body.setVelocityX(0);
      this.playAnim("idle");
      return "idle";
    }
  }

  playAnim(key) {
    this.anims.play(key, true);
  }
}
