import { Spritesheet, Texture } from 'pixi.js';
import loadSpritesheetData from '../sprites/data-loader';
import { spritesheetDataToPixi } from '../sprites/data-to-pixi';

class Loader {
  textures: Record<string, Texture> = {};
  loaded: string[] = [];

  async loadSpritesheet(spritesheet: string): Promise<void> {
    if (this.loaded.includes(spritesheet)) {
      return;
    }

    const data = await loadSpritesheetData(spritesheet);
    const texture = await Texture.fromURL(`/orgx/gm/${spritesheet}.png`);
    const pxSpritesheet = new Spritesheet(
      texture.baseTexture,
      spritesheetDataToPixi(spritesheet, data)
    );
    await pxSpritesheet.parse();

    this.textures = {
      ...this.textures,
      ...pxSpritesheet.textures,
    };

    this.loaded.push(spritesheet);
  }
}

const loader = new Loader();
export default loader;
