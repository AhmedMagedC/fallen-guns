import { Anim } from "../animation/animation.js";
export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, name) {
    super(scene, x, y, `${name}_idle_right`);
    this.scene = scene;
    this.name = name;
    this.recentKey = null;
    this.animation = new Anim(this.scene, this.name);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.init();
  }
  init() {
    this.body.setCollideWorldBounds(true);
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.animation.createAnim();
  }
  updateMovement() {
    if (!this.body.touching.down && this.body.velocity.y > 0) {
      if (this.recentKey == this.cursor.right || !this.recentKey) {
        this.playAnim("run right");
        return "run right";
      } else {
        this.playAnim("run left");
        return "run left";
      }
    } else if (this.cursor.left.isDown) {
      this.runLeft();
      return "run left";
    } else if (this.cursor.right.isDown) {
      this.runRight();
      return "run right";
    } else if (this.cursor.up.isDown) {
      if (this.cursor.right.isDown) {
        this.recentKey = this.cursor.right;
        this.body.setVelocityX(400);
        this.playAnim("jump right", true);
        return "jump right";
      } else {
        this.body.setVelocityY(-100);
        this.playAnim("jump right", true);
        return "jump right";
      }
    } else {
      var idle_pos =
        this.recentKey == this.cursor.left ? "idle left" : "idle right";
      this.body.setVelocityX(0);
      this.playAnim(idle_pos);
      return idle_pos;
    }
  }

  playAnim(key) {
    this.anims.play(key, true);
  }

  runRight() {
    this.recentKey = this.cursor.right;
    this.body.setVelocityX(400);
    this.playAnim("run right");
  }

  runLeft() {
    this.recentKey = this.cursor.left;
    this.body.setVelocityX(-400);
    this.playAnim("run left");
  }
}
