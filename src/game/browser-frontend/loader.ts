import { Spritesheet, Texture } from 'pixi.js';
import loadSpritesheetData from '../../sprites/data-loader';
import { Gm1 } from '../../sprites/data-parser';
import { spritesheetDataToPixi } from '../../sprites/data-to-pixi';

class Loader {
  textures: Record<string, Texture> = {};
  gm1s: Record<string, Gm1> = {};
  loaded: string[] = [];

  async loadSpritesheet(spritesheet: string): Promise<void> {
    if (this.loaded.includes(spritesheet)) {
      return;
    }

    const data = await loadSpritesheetData(spritesheet);
    const texture = await Texture.fromURL(`/orgx/gm/${spritesheet}.png`);
    const pxSpritesheet = new Spritesheet(
      texture.baseTexture,
      spritesheetDataToPixi(spritesheet, data.images)
    );
    await pxSpritesheet.parse();

    this.textures = {
      ...this.textures,
      ...pxSpritesheet.textures,
    };
    this.gm1s[spritesheet] = data;

    this.loaded.push(spritesheet);
  }
}

const loader = new Loader();
export default loader;
