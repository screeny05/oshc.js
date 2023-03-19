import loadSpritesheetData from './data-loader';
import { IndexFileEntry } from './data-parser';
import { loadImage } from './modify-sprite';

export interface BorderImage {
  url: string;
  slice: string;
}

export interface TextureMap {
  nw: number;
  nwMask?: number;
  n: number;
  nMask?: number;
  ne: number;
  neMask?: number;
  e: number;
  eMask?: number;
  se: number;
  seMask?: number;
  s: number;
  sMask?: number;
  sw: number;
  swMask?: number;
  w: number;
  wMask?: number;
  bg: number;
  bgMask?: number;
}

function canvasGrayscaleToAlpha(canvas: OffscreenCanvas): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire context2d.');
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (var i = 0; i < data.length; i += 4) {
    data[i + 3] = data[i];
    //data[i] = data[i + 1] = data[i + 2] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
}

function drawBorderImage(
  img: HTMLImageElement,
  data: IndexFileEntry[],
  map: TextureMap
): OffscreenCanvas {
  const width = data[map.ne].w + data[map.n].w + data[map.ne].w;
  const height = data[map.ne].h + data[map.e].h + data[map.se].h;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not acquire context2d.');
  }

  const nw = data[map.nw];
  const n = data[map.n];
  const ne = data[map.ne];
  const w = data[map.w];
  const bg = data[map.bg];
  const e = data[map.e];
  const sw = data[map.sw];
  const s = data[map.s];
  const se = data[map.se];
  const col2X = nw.w;
  const col3X = col2X + n.w;
  const row2Y = nw.h;
  const row3Y = row2Y + w.h;

  ctx.drawImage(img, nw.x, nw.y, nw.w, nw.h, 0, 0, nw.w, nw.h);
  ctx.drawImage(img, n.x, n.y, n.w, n.h, col2X, 0, n.w, n.h);
  ctx.drawImage(img, ne.x, ne.y, ne.w, ne.h, col3X, 0, n.w, n.h);

  ctx.drawImage(img, w.x, w.y, w.w, w.h, 0, row2Y, w.w, w.h);
  ctx.drawImage(img, bg.x, bg.y, bg.w, bg.h, col2X, row2Y, bg.w, bg.h);
  ctx.drawImage(img, e.x, e.y, e.w, e.h, col3X, row2Y, e.w, e.h);

  ctx.drawImage(img, sw.x, sw.y, sw.w, sw.h, 0, row3Y, sw.w, sw.h);
  ctx.drawImage(img, s.x, s.y, s.w, s.h, col2X, row3Y, s.w, s.h);
  ctx.drawImage(img, se.x, se.y, se.w, se.h, col3X, row3Y, se.w, se.h);

  return canvas;
}

function textureMapToMaskMap(map: TextureMap): TextureMap | undefined {
  if (
    map.nwMask &&
    map.nMask &&
    map.neMask &&
    map.wMask &&
    map.bgMask &&
    map.eMask &&
    map.swMask &&
    map.sMask &&
    map.seMask
  ) {
    return {
      nw: map.nwMask,
      n: map.nMask,
      ne: map.neMask,
      w: map.wMask,
      bg: map.bgMask,
      e: map.eMask,
      sw: map.swMask,
      s: map.sMask,
      se: map.seMask,
    };
  }
  return undefined;
}

export async function buildBorderImage(
  spritesheet: string,
  map: TextureMap
): Promise<BorderImage> {
  const gm1 = await loadSpritesheetData(spritesheet);
  const sprites = gm1.images;
  const img = await loadImage(`/orgx/gm/${spritesheet}.png`);

  const borderImage = drawBorderImage(img, sprites, map);

  const maskMap = textureMapToMaskMap(map);

  if (maskMap) {
    const maskImage = drawBorderImage(img, sprites, maskMap);
    const ctx = borderImage.getContext('2d');
    if (!ctx) {
      throw new Error('Could not acquire context2d.');
    }

    ctx.globalCompositeOperation = 'destination-in';
    canvasGrayscaleToAlpha(maskImage);
    ctx.drawImage(maskImage, 0, 0);
  }

  const blob = await borderImage.convertToBlob();

  return {
    url: URL.createObjectURL(blob),
    slice: `${sprites[map.nw].h} ${sprites[map.ne].w} ${sprites[map.sw].h} ${
      sprites[map.sw].w
    } fill`,
  };
}
