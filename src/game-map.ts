import { VecIso } from './game/types';
import { MapMath } from './map-math';

export enum TileType {
  sand,
  grass,
  water,
}

export interface Building {}

export interface Entity {}

export class GameMap {
  public readonly tiles: Uint16Array;
  public readonly decals: Uint16Array;
  public readonly buildings: Building[] = [];
  public readonly entities: Entity[] = [];
  readonly math: MapMath;

  constructor(public readonly size: number) {
    this.math = new MapMath(this.size);
    const tileCount = this.math.calculateTileCount(size);
    this.tiles = new Uint16Array(tileCount);
    this.decals = new Uint16Array(tileCount);

    this.tiles.forEach(
      (_, i) => (this.tiles[i] = Math.floor(Math.random() * 12))
    );
  }

  forEachTile(
    fn: (tile: TileType, vecIso: VecIso, index: number) => void
  ): void {
    let row = 0;
    let lastColumnInRow = this.math.getLastColumnInRow(row);
    let column = this.math.getFirstColumnInRow(row);
    this.tiles.forEach((tile, i) => {
      fn(tile, { i: column, j: row }, i);

      column++;
      if (column === lastColumnInRow + 1) {
        row++;
        lastColumnInRow = this.math.getLastColumnInRow(row);
        column = this.math.getFirstColumnInRow(row);
      }
    });
  }

  at(x: number, y: number): number {
    const i = this.math.getIndexByPosition(x, y);
    return this.tiles[i];
  }

  placeBuilding(x: number, y: number, buildingIndex: number): void {}
}
