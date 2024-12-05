export class BootLoader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }
  preload() {
    this.load.spritesheet(
      "gang1_idle_left",
      "../../public/assets/Gangsters_1/idle left.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.spritesheet(
      "gang1_idle_right",
      "../../public/assets/Gangsters_1/idle right.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_run_right",
      "../../public/assets/Gangsters_1/run right.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_run_left",
      "../../public/assets/Gangsters_1/run left.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_jump_right",
      "../../public/assets/Gangsters_1/Jump Right.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_jump_left",
      "../../public/assets/Gangsters_1/Jump Left.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_dbljump_right",
      "../../public/assets/Gangsters_1/Jump right.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_dbljump_left",
      "../../public/assets/Gangsters_1/Jump Left.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_shot_left",
      "../../public/assets/Gangsters_1/Shot Left.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      "gang1_shot_right",
      "../../public/assets/Gangsters_1/Shot Right.png",
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
    this.load.image(
      "background",
      "../../public/assets/Backgrounds/Background.png"
    );

    this.load.image("bullet", "../../public/assets/Bullets/bullet.png");
    this.load.image("platform", "../../public/assets/platform.jpg");
  }
  create() {
    this.scene.start("firstscene"); // Switch to FirstScene
  }
}
