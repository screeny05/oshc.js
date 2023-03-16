import { VecIso } from './game/types';

export class MapMath {
  private readonly remainder: number;
  private readonly count: number;

  constructor(private readonly size: number) {
    this.remainder = size % 2;
    this.count = this.calculateTileCount(size);
  }

  isPositionNull(x: number, y: number): boolean {
    const columnsInRow = this.getColumnsInRow(y);
    const firstColumn = (this.size - columnsInRow) / 2;
    const lastColumn = (this.size + columnsInRow) / 2 - 1;
    return x < firstColumn || x > lastColumn;
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
    return {
      i: index % this.size,
      j: Math.floor(index / this.size),
    };
  }

  getIndexByPosition(x: number, y: number): number {
    return y * this.size + x;
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
