import {
  Grid,
  I_NavigatorTile,
  Navigator,
  NavigatorTile,
} from 'pulsar-pathfinding';
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
  public readonly grid: Grid;
  readonly math: MapMath;

  constructor(public readonly size: number) {
    this.math = new MapMath(this.size);
    this.tiles = new Uint16Array(size * size);
    this.decals = new Uint16Array(size * size);
    this.grid = new Grid({ width: size, height: size });

    this.tiles.forEach((_, i) => {
      // TODO: Probably not the most efficient
      const pos = this.math.getPositionByIndex(i);
      const isNull = this.math.isPositionNull(pos.i, pos.j);

      this.tiles[i] = isNull ? TILE_NULL : Math.floor(Math.random() * 12);

      if (isNull) {
        this.grid.obstacles.add(this.grid.getTile({ x: pos.i, y: pos.j })!);
      }

      if (this.tiles[i] < 3) {
        this.tiles[i] = 20;
        this.grid.obstacles.add(this.grid.getTile({ x: pos.i, y: pos.j })!);
      }
    });
  }

  forEachTile(
    fn: (tile: TileType, vecIso: VecIso, index: number) => void
  ): void {
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

  getPath(start: VecIso, end: VecIso): Promise<I_NavigatorTile[]> {
    const startTile = this.grid.getTile({ x: start.i, y: start.j });
    const endTile = this.grid.getTile({ x: end.i, y: end.j });
    if (!startTile || !endTile) {
      throw new Error('Invalid start or end');
    }

    return new Promise((resolve) => {
      new Navigator({
        grid: this.grid,
        begin: startTile,
        end: endTile,
        onComplete: resolve,
      }).start();
    });
  }
}
