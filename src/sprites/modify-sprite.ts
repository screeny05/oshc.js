import loadSpritesheetData from './data-loader';
import { IndexFileEntry } from './data-parser';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
    img.complete ? resolve(img) : null;
  });
};

export const modifySprite = async (
  spritesheet: string,
  entry: IndexFileEntry,
  fn: (data: Uint8ClampedArray) => void,
  upscale: boolean = false
): Promise<string> => {
  const img = await loadImage(`/orgx/gm/${spritesheet}.png`);

  const factor = upscale ? window.devicePixelRatio ?? 1 : 1;
  const canvas = new OffscreenCanvas(entry.w * factor, entry.h * factor);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to obtain context2d from OffscreenCanvas.');
  }

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    img,
    entry.x,
    entry.y,
    entry.w,
    entry.h,
    0,
    0,
    entry.w * factor,
    entry.h * factor
  );

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  fn(imgData.data);
  ctx.putImageData(imgData, 0, 0);

  const blob = await canvas.convertToBlob();
  return URL.createObjectURL(blob);
};

export const extractSpriteFromSheet = async (
  spritesheet: string,
  index: number,
  upscale: boolean = false
): Promise<string> => {
  const gm1 = await loadSpritesheetData(spritesheet);
  return modifySprite(spritesheet, gm1.images[index], () => {}, upscale);
};
