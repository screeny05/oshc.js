import { VecIso } from './game/types';

export class MapMath {
  private readonly remainder: number;
  private readonly count: number;

  constructor(private readonly size: number) {
    this.remainder = size % 2;
    this.count = this.calculateTileCount(size);
  }

  calculateTileCount(size: number): number {
    // Scientifically proven!
    const remainder = size % 2;
    const flooredSize = size - remainder;
    return (flooredSize * flooredSize) / 2 + flooredSize + remainder;
  }

  getColumnsInRow(cRow: number): number {
    return cRow < this.size / 2
      ? cRow * 2 + 2 - this.remainder
      : (this.size - cRow) * 2 - this.remainder;
  }

  getPositionByIndex(index: number): VecIso {
    let previousTiles = 0;
    for (let row = 0; row < this.count + 1; row++) {
      const columnsInRow = this.getColumnsInRow(row);

      if (previousTiles + columnsInRow > index) {
        const firstColumnInRow = this.getFirstColumnInRow(row);

        return {
          i: row,
          j: firstColumnInRow + index - previousTiles,
        };
      }

      previousTiles += columnsInRow;
    }
    throw new Error(`Given index ${index} is out of bounds.`);
  }

  getIndexByPosition(x: number, y: number): number {
    const firstIndex = this.getIndexForFirstTileInRow(y);
    const firstColumnInRow = this.getFirstColumnInRow(y);
    return firstIndex + x - firstColumnInRow;
  }

  getFirstColumnInRow(cRow: number) {
    return (this.size - this.getColumnsInRow(cRow)) / 2;
  }

  getLastColumnInRow(cRow: number) {
    return (this.size + this.getColumnsInRow(cRow)) / 2 - 1;
  }

  getIndexForFirstTileInRow(cRow: number) {
    let previousTiles = 0;
    for (let row = 0; row < cRow; row++) {
      const columnsInRow = this.getColumnsInRow(row);
      previousTiles += columnsInRow;
    }
    return previousTiles;
  }
}
