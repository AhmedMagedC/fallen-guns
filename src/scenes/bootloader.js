export class BootLoader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }
  preload() {
    const characters = ["Gangsters_1", "Gangsters_2", "Raider_1"]; // currently available characters in the game
    for (const char of characters) this.loadCharacterAssets(char);
    this.load.image(
      "background",
      "../../public/assets/Backgrounds/Background.png"
    );
    this.load.image("bullet", "../../public/assets/Bullets/bullet.png");
    this.load.image("platform", "../../public/assets/platform.jpg");
  }
  create() {
    this.scene.start("mainmenu"); // Switch to FirstScene
  }

  loadCharacterAssets(name) {
    this.load.image(`${name}`, `../../public/assets/${name}/${name}.png`);
    this.load.audio(
      `${name}_gun_sound`,
      `../../public/assets/Audio/${name}_gun_sound.mp3`
    );
    this.load.spritesheet(
      `${name}_idle_left`,
      `../../public/assets/${name}/idle left.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_idle_right`,
      `../../public/assets/${name}/idle right.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_run_right`,
      `../../public/assets/${name}/run right.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_run_left`,
      `../../public/assets/${name}/run left.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_jump_left`,
      `../../public/assets/${name}/jump left.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_jump_right`,
      `../../public/assets/${name}/jump right.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_dbljump_left`,
      `../../public/assets/${name}/jump left.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_dbljump_right`,
      `../../public/assets/${name}/jump right.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_shot_left`,
      `../../public/assets/${name}/shot left.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_shot_right`,
      `../../public/assets/${name}/shot right.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_hurt_left`,
      `../../public/assets/${name}/hurt left.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );

    this.load.spritesheet(
      `${name}_hurt_right`,
      `../../public/assets/${name}/hurt right.png`,
      {
        frameWidth: 128,
        frameHeight: 128,
      }
    );
  }
}
