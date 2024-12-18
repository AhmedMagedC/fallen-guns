export const characterStats = [
  {
    Gangsters_1: {
      name: "Gangsters_1",
      bulletTime: 100,
      damage: 2,
      ammo: 10,
      health: 10,
      gunType: "rifle",
      numOfAnimationAttack: 1, // number of shooting animation
      frameWidth: 128 /* used in bootloader to correctly load sprite animation*/,
      frameHeight: 128,
      hitbox: {
        // adjust the hitbox for each sprite
        sizeX: 30,
        sizeY: 80,
      },
      scale: 1, // how much does it need to be scaled when added to the scene
    },
  },
  {
    Gangsters_2: {
      name: "Gangsters_2",
      bulletTime: 250,
      damage: 6,
      ammo: 3,
      health: 10,
      gunType: "pistol",
      numOfAnimationAttack: 1, // number of shooting animation
      frameWidth: 128 /* used in bootloader to correctly load sprite animation*/,
      frameHeight: 128,
      hitbox: {
        // adjust the hitbox for each sprite
        sizeX: 30,
        sizeY: 80,
      },
      scale: 1, // how much does it need to be scaled when added to the scene
    },
  },
  {
    Raider_1: {
      name: "Raider_1",
      bulletTime: 200,
      damage: 6,
      ammo: 6,
      health: 10,
      gunType: "shotgun",
      numOfAnimationAttack: 1, // number of shooting animation
      frameWidth: 128 /* used in bootloader to correctly load sprite animation*/,
      frameHeight: 128,
      hitbox: {
        // adjust the hitbox for each sprite
        sizeX: 30,
        sizeY: 80,
      },
      scale: 1, // how much does it need to be scaled when added to the scene
    },
  },
  {
    Knight: {
      name: "Knight",
      bulletTime: 0,
      damage: 6,
      ammo: 6,
      health: 10,
      gunType: "sword",
      numOfAnimationAttack: 2, // number of shooting animation
      frameWidth: 120 /* used in bootloader to correctly load sprite animation*/,
      frameHeight: 80,
      hitbox: {
        // adjust the hitbox for each sprite
        sizeX: 25,
        sizeY: 35,
      },
      scale: 1.7, // how much does it need to be scaled when added to the scene
    },
  },
];
