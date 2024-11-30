export class BootLoader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }
  preload() {
    this.load.spritesheet(
      "frog_idle_right",
      "../../public/assets/Ninja Frog/Idle Right.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "frog_idle_left",
      "../../public/assets/Ninja Frog/Idle Left.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      "frog_run_right",
      "../../public/assets/Ninja Frog/Run Right.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.spritesheet(
      "frog_run_left",
      "../../public/assets/Ninja Frog/Run Left.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "frog_jump_right",
      "../../public/assets/Ninja Frog/Jump Right.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.spritesheet(
      "frog_jump_left",
      "../../public/assets/Ninja Frog/Jump Left.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );

    this.load.image(
      "background",
      "../../public/assets/Backgrounds/Background.png"
    );
    this.load.image(
      "platform",
      "../../public/assets/platform.jpg"
    );
  }
  create() {
    this.scene.start("firstscene"); // Switch to FirstScene
  }
}
