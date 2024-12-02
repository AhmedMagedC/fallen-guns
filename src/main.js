import { FirstScene } from "./scenes/firstscene.js";
import { BootLoader } from "./scenes/bootloader.js";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 900, // 900
    height: 600, // 690
  },
  scene: [BootLoader, FirstScene],
};

var game = new Phaser.Game(config);
