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

export interface IndexFileEntry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function parseDataFile(data: string): IndexFileEntry[] {
  const lines = data.split('\n');
  const typeString = lines[0].slice(1);
  const type = Gm1Type[typeString as Gm1Type] ?? Gm1Type.other;

  return data
    .split('\n')
    .filter(
      (line) =>
        line &&
        !line.startsWith('!') &&
        !line.startsWith('[') &&
        !line.startsWith('#') &&
        line.split(',').length === 4
    )
    .map((line) => {
      const [x, y, w, h] = line.split(',').map((s) => Number.parseInt(s, 10));
      return { x, y, w, h };
    });
}
