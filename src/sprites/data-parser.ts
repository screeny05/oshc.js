export enum Gm1Type {
  tile = 'tile',
  anim = 'anim',
  other = 'other',
}

export interface Gm1Image {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Gm1Object {
  offset: number;
  count: number;
}

export interface Gm1Tile {
  x: number;
  y: number;
  posx: number;
  posy: number;
  w: number;
  h: number;
}

export interface Gm1Animation {
  centerX: number;
  centerY: number;
}

export interface Gm1 {
  type: Gm1Type;
  images: Gm1Image[];
  objects?: Gm1Object[];
  tiles?: Gm1Tile[];
  animations?: Gm1Animation[];
}

const lineToNumbersArray = (line: string): number[] => {
  return line.split(',').map((str) => Number.parseInt(str, 10));
};

const lineToGm1Image = (line: string): Gm1Image | undefined => {
  const split = lineToNumbersArray(line);
  if (split.length !== 4) {
    return;
  }
  const [x, y, w, h] = split;
  return { x, y, w, h };
};

const lineToGm1Object = (line: string): Gm1Object | undefined => {
  const split = lineToNumbersArray(line);
  if (split.length !== 2) {
    return;
  }
  const [offset, count] = split;
  return { offset, count };
};

const lineToGm1Tile = (line: string): Gm1Tile | undefined => {
  const split = lineToNumbersArray(line);
  if (split.length !== 6) {
    return;
  }
  const [x, y, posx, posy, w, h] = split;
  return { x, y, posx, posy, w, h };
};

const lineToGm1Animation = (line: string): Gm1Animation | undefined => {
  const split = lineToNumbersArray(line);
  if (split.length !== 2) {
    return;
  }
  const [centerX, centerY] = split;
  return { centerX, centerY };
};

export interface IndexFileEntry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function parseDataFile(data: string): Gm1 {
  const lines = data.split('\n');
  const typeString = lines[0].slice(1);
  const type = Gm1Type[typeString as Gm1Type] ?? Gm1Type.other;
  const gm1: Gm1 = {
    type,
    images: [],
  };

  let currentMode: string | undefined;
  lines.forEach((line) => {
    if (line.startsWith('#')) {
      return;
    }
    if (line.startsWith('[')) {
      currentMode = line.slice(1).split(',')[0];
    }
    if (currentMode === 'images') {
      const parsed = lineToGm1Image(line);
      if (parsed) {
        gm1.images.push(parsed);
      }
    }
    if (currentMode === 'objects') {
      const parsed = lineToGm1Object(line);
      if (parsed) {
        gm1.objects ??= [];
        gm1.objects.push(parsed);
      }
    }
    if (currentMode === 'tiles') {
      const parsed = lineToGm1Tile(line);
      if (parsed) {
        gm1.tiles ??= [];
        gm1.tiles.push(parsed);
      }
    }
    if (currentMode === 'animation') {
      const parsed = lineToGm1Animation(line);
      if (parsed) {
        gm1.animations ??= [];
        gm1.animations.push(parsed);
      }
    }
  });

  return gm1;
}
