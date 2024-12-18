/* 
Anim class is used to create different animations for different states for each player 
(idle , running right , running left , jumping right , .... etc)
it's determined by using <characterName>_<state>_<facingRightOrLeft>
*/

// animations are preloaded in bootloader.js

export class Anim {
  constructor(id, scene, gameObjName, numOfAttacks) {
    this.id = id;
    this.name = gameObjName;
    this.scene = scene;
    this.numOfAttacks = numOfAttacks;
    if (this.name == "Gangsters_2")
      this.gunBuff = 10; // make the fire animation for gang2 faster
    else this.gunBuff = 0;
  }

  createAnim() {
    this.scene.anims.create({
      key: `${this.id} run right`,
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_run_right`, {
        start: 0,
        end:
          this.scene.textures.get(`${this.name}_run_right`).getFrameNames()
            .length - 1,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: `${this.id} run left`,
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_run_left`, {
        start:
          this.scene.textures.get(`${this.name}_run_left`).getFrameNames()
            .length - 1,
        end: 0,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.scene.anims.create({
      key: `${this.id} idle right`,
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_idle_right`, {
        start: 0,
        end:
          this.scene.textures.get(`${this.name}_idle_right`).getFrameNames()
            .length - 1,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: `${this.id} idle left`,
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_idle_left`, {
        start:
          this.scene.textures.get(`${this.name}_idle_left`).getFrameNames()
            .length - 1,
        end: 0,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: `${this.id} jump right`,
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_jump_right`, {
        start: 0,
        end:
          this.scene.textures.get(`${this.name}_jump_right`).getFrameNames()
            .length - 1,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: `${this.id} jump left`,
      frames: this.scene.anims.generateFrameNumbers(`${this.name}_jump_left`, {
        start:
          this.scene.textures.get(`${this.name}_jump_left`).getFrameNames()
            .length - 1,
        end: 0,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: `${this.id} dbljump right`,
      frames: this.scene.anims.generateFrameNumbers(
        `${this.name}_dbljump_right`,
        {
          start: 0,
          end:
            this.scene.textures
              .get(`${this.name}_dbljump_right`)
              .getFrameNames().length - 1,
        }
      ),
      frameRate: 10,
      repeat: 0,
    });

    this.scene.anims.create({
      key: `${this.id} dbljump left`,
      frames: this.scene.anims.generateFrameNumbers(
        `${this.name}_dbljump_left`,
        {
          start:
            this.scene.textures.get(`${this.name}_dbljump_left`).getFrameNames()
              .length - 1,
          end: 0,
        }
      ),
      frameRate: 10,
      repeat: 0,
    });
    for (let shot = 0; shot < this.numOfAttacks; shot++) {
      this.scene.anims.create({
        key: `${this.id} shot left ${shot}`,
        frames: this.scene.anims.generateFrameNumbers(
          `${this.name}_shot_left_${shot}`,
          {
            start:
              this.scene.textures
                .get(`${this.name}_shot_left_${shot}`)
                .getFrameNames().length - 1,
            end: 0,
          }
        ),
        frameRate: 10 + this.gunBuff,
        repeat: 0,
      });

      this.scene.anims.create({
        key: `${this.id} shot right ${shot}`,
        frames: this.scene.anims.generateFrameNumbers(
          `${this.name}_shot_right_${shot}`,
          {
            start: 0,
            end:
              this.scene.textures
                .get(`${this.name}_shot_right_${shot}`)
                .getFrameNames().length - 1,
          }
        ),
        frameRate: 10 + this.gunBuff,
        repeat: 0,
      });
    }
  }
}
