import { characterStats } from "../model/characters.js";
export class BootLoader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }
  preload() {
    characterStats.forEach((char) => {
      const key = Object.keys(char)[0];
      this.loadCharacterAssets(char[key]);
    });
    
    this.load.image(
      "sky forest",
      "../../public/assets/Backgrounds/sky forest.png"
    );
    this.load.image("bullet", "../../public/assets/Bullets/bullet.png");
    this.load.image("ammo crate", "../../public/assets/Bullets/ammo crate.png");
    this.load.image(
      "green ground",
      "../../public/assets/platforms/green ground.jpg"
    );
    this.load.image(
      "blood particle",
      "../../public/assets/particles/blood particle.png"
    );
  }
  create() {
    this.scene.start("mainmenu"); // Switch to FirstScene
  }

  loadCharacterAssets(char) {
    this.load.image(
      `${char.gunType} ammo`,
      `../../public/assets/ammo/${char.gunType} ammo.png`
    );

    const name = char.name;
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
