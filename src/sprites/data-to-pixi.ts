import { ISpritesheetData } from 'pixi.js';
import { IndexFileEntry } from './data-parser';

export function spritesheetDataToPixi(
  spritesheet: string,
  data: IndexFileEntry[]
): ISpritesheetData {
  return {
    frames: Object.fromEntries(
      data.map((entry, i) => [spritesheet + i, { frame: entry }])
    ),
    meta: {
      scale: '1',
    },
  };
}
