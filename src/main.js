import { FirstScene } from "./scenes/firstscene.js";
import { BootLoader } from "./scenes/bootloader.js";
import { MainMenu } from "./scenes/mainmenu.js";
const ratio = Math.max(
  window.innerWidth / window.innerHeight,
  window.innerHeight / window.innerWidth
);
const DEFAULT_HEIGHT = 720; // any height you want
const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT;

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: {
        y: 800,
      },
    },
  },
  scene: [BootLoader, MainMenu, FirstScene],
};

var game = new Phaser.Game(config);
// const config = {
//   type: Phaser.AUTO,
//   width: 800,
//   height: 600,
//   backgroundColor: "#2d2d2d",
//   scene: {
//     preload: preload,
//     create: create,
//   },
// };

// const game = new Phaser.Game(config);

// let characters = [];
// let selectedCharacter = null;

// function preload() {
//   // Load character sprites
//   this.load.image("police", "../public/assets/Gangsters_1/run right.png");
//   this.load.image("detective", "../public/assets/Gangsters_1/run right.png");
//   this.load.image("agent", "../public/assets/Gangsters_1/run right.png");
// }

// function create() {
//   const characterData = [
//     { key: "police", name: "Police Officer", x: 200, y: 300 },
//     { key: "detective", name: "Detective", x: 400, y: 300 },
//     { key: "agent", name: "Agent", x: 600, y: 300 },
//   ];

//   // Render characters
//   characterData.forEach((data) => {
//     const character = this.add.image(data.x, data.y, data.key).setInteractive();
//     character.setScale(1.5); // Scale sprites if needed
//     character.name = data.name;

//     // Add selection highlight
//     character.on("pointerdown", () => selectCharacter.call(this, character));
//     characters.push(character);
//   });

//   // Add text for instruction
//   this.add
//     .text(400, 100, "Select Your Character", {
//       fontSize: "32px",
//       fill: "#ffffff",
//     })
//     .setOrigin(0.5);
// }

// function selectCharacter(character) {
//   // Remove highlight from previously selected character
//   if (selectedCharacter) {
//     selectedCharacter.setTint(0xffffff); // Reset color
//   }

//   // Highlight the selected character
//   character.setTint(0x00ff00); // Green tint
//   selectedCharacter = character;

//   // Display selected character name
//   if (this.selectionText) this.selectionText.destroy();
//   this.selectionText = this.add
//     .text(400, 500, `You Selected: ${character.name}`, {
//       fontSize: "24px",
//       fill: "#ffffff",
//     })
//     .setOrigin(0.5);
// }
