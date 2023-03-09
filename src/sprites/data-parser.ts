export interface IndexFileEntry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function parseDataFile(data: string): IndexFileEntry[] {
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
