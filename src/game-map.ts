import { VecIso } from './game/types';
import { MapMath } from './map-math';

export enum TileType {
  sand,
  grass,
  water,
}

export interface Building {}

export interface Entity {}

const TILE_NULL = 0xffff;

export class GameMap {
  public readonly tiles: Uint16Array;
  public readonly decals: Uint16Array;
  public readonly buildings: Building[] = [];
  public readonly entities: Entity[] = [];
  public readonly collisionMap: number[][];
  readonly math: MapMath;

  constructor(public readonly size: number) {
    this.math = new MapMath(this.size);
    this.tiles = new Uint16Array(size * size);
    this.decals = new Uint16Array(size * size);
    this.collisionMap = Array.from({ length: this.size });

    this.tiles.forEach((_, i) => {
      // TODO: Probably not the most efficient
      const pos = this.math.getPositionByIndex(i);
      const isNull = this.math.isPositionNull(pos.i, pos.j);

      this.tiles[i] = isNull ? TILE_NULL : Math.floor(Math.random() * 12);
    });

    // Generate collision map
    for (let j = 0; j < this.size; j++) {
      for (let i = 0; i < this.size; i++) {
        if (j === 0) {
          this.collisionMap[i] = Array.from({ length: this.size });
        }
        const tile = this.tiles[this.math.getIndexByPosition(j, i)];
        const costs = tile === TILE_NULL ? TILE_NULL : tile === 12 ? 0 : 0;
        this.collisionMap[i][j] = costs;
      }
    }
  }

  forEachTile(fn: (tile: TileType, vecIso: VecIso, index: number) => void): void {
    this.tiles.forEach((tile, i) => {
      if (tile === TILE_NULL) {
        return;
      }
      fn(tile, this.math.getPositionByIndex(i), i);
    });
  }

  at(x: number, y: number): number | undefined {
    if (this.math.isPositionNull(x, y)) {
      return undefined;
    }

    const i = this.math.getIndexByPosition(x, y);
    return this.tiles[i];
  }

  to2dGrid(): number[][] {
    const grid: number[][] = [];

    return grid;
  }
}
