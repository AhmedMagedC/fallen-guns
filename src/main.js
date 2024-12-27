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
  parent: "phaser-game",
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
