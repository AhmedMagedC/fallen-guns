let selectedChar = null;
export class MainMenu extends Phaser.Scene {
  constructor() {
    super({
      key: "mainmenu",
    });
  }
  preload() {
    this.load.image("play button", "../../public/assets/play button.png");
  }
  create() {
    const characters = ["Gangsters_1", "Gangsters_2", "Raider_1"]; // currently available characters in the game
    const fireCoolDown = { Gangsters_1: 100, Gangsters_2: 800, Raider_1: 200 }; // cool down between shots for every characater

    let initX = 300,
      InitY = 300;

    characters.forEach((char) => {
      const character = this.add.image(initX, InitY, char).setInteractive();
      character.setScale(2);
      character.name = char;

      character.on("pointerdown", () =>
        this.selectCharacter.call(this, character, fireCoolDown)
      );
      initX += 300;
    });

    this.add
      .text(700, 100, "Select Your Character", {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
  }

  selectCharacter(character, fireCoolDown) {
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
        name: selectedChar.name,
        fireCoolDown: fireCoolDown[selectedChar.name],
      });
    });
  }
}
