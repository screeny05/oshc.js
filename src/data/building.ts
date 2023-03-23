import { VecIso } from '../game/types';
import { GoodsCollection } from '../game/engine';

export interface BuildingTileSprite {
  spritesheet: string;
  index: number;
  destroyedIndex?: number;
}

export interface BuildingTile {
  spriteN: BuildingTileSprite;
  spriteE?: BuildingTileSprite;
  spriteS?: BuildingTileSprite;
  spriteW?: BuildingTileSprite;
  walkable: boolean;
  width: number;
  height: number;
  offset?: VecIso;
}

export interface BuildingCosts {
  goods: GoodsCollection;
}

export interface Building {
  type: string;
  tiles: BuildingTile[];
  health: number;
  costs: BuildingCosts;
}

export const buildingCollection: Record<number, Building> = {
  0: {
    type: 'tower_3x3',
    tiles: [
      {
        spriteN: {
          spritesheet: 'tile_castle',
          index: 97,
          destroyedIndex: 98,
        },
        height: 3,
        width: 3,
        walkable: false,
      },
    ],
    health: 10,
    costs: {
      goods: { gold: 0, iron: 0, stone: 0, wood: 0 },
    },
  },
  1: {
    type: 'quarters',
    tiles: [
      {
        spriteN: {
          spritesheet: 'tile_buildings2',
          index: 25,
        },
        height: 5,
        width: 5,
        walkable: false,
      },
      {
        spriteN: {
          spritesheet: 'tile_buildings1',
          index: 25,
        },
        height: 5,
        width: 5,
        walkable: true,
        offset: { i: 0, j: 0 },
      },
    ],
    health: 10,
    costs: {
      goods: { gold: 0, iron: 0, stone: 0, wood: 0 },
    },
  },
};
