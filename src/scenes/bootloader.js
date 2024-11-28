export class BootLoader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }
  preload() {
    this.load.spritesheet(
      "frog_idle",
      "../../public/assets/Ninja Frog/Idle (32x32).png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      "frog_right",
      "../../public/assets/Ninja Frog/Run Right.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      "frog_left",
      "../../public/assets/Ninja Frog/Run Left.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    
    this.load.image("background","../../public/assets/Backgrounds/Background.png")
  }
  create() {
    this.scene.start("firstscene"); // Switch to FirstScene
  }
}
