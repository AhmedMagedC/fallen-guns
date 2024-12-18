import { characterStats } from "../model/characters.js";

let selectedChar = null;
export class MainMenu extends Phaser.Scene {
  constructor() {
    super({
      key: "mainmenu",
    });
  }
  preload() {
    this.load.image("play button", "../../public/assets/misc/play button.png");
  }
  create() {
    let initX = 300,
      InitY = 300;

    characterStats.forEach((char) => {
      const key = Object.keys(char)[0];
      const character = this.add.image(initX, InitY, key).setInteractive();
      character.charStats = char[key];
      character.setScale(character.charStats.scale);

      character.on("pointerdown", () =>
        this.selectCharacter.call(this, character)
      );
      initX += 300;

      if (initX > this.scale.width) {
        InitY += 100;
        initX = 0;
      }
    });

    this.add
      .text(700, 100, "Select Your Character", {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
  }

  selectCharacter(character) {
    // Remove highlight from previously selected character
    if (selectedChar) {
      selectedChar.setTint(0xffffff); // Reset color
    }

    // Highlight the selected character
    // console.log(selectedChar.name);
    character.setTint(0x00ff00); // Green tint
    selectedChar = character;

    // add play button to start the next scene
    const playButton = this.add.image(700, 600, "play button").setInteractive();
    playButton.setScale(0.2);
    playButton.on("pointerdown", () => {
      this.scene.start("firstscene", {
        charStats: selectedChar.charStats,
      });
    });
  }
}
