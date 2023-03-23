import {
  addComponent,
  addEntity,
  Changed,
  Component,
  createWorld,
  defineComponent,
  defineQuery,
  defineSystem,
  enterQuery,
  IWorld,
  removeComponent,
  System,
  Types,
} from 'bitecs';
import { GameMap } from '../game-map';
import { createPathFindingSystem } from './systems/path-finding.system';
import { glMatrix } from 'gl-matrix';
import { Vec2, VecIso as VecIsoType } from './types';

glMatrix.setMatrixArrayType(Array);

export interface GoodsCollection {
  wood: number;
  stone: number;
  iron: number;
  gold: number;
}

export interface PlayerData {
  goods: GoodsCollection;
}

export interface World extends IWorld {
  time: {
    delta: number;
    deltaS: number;
    elapsed: number;
    then: number;
  };
  playerData: Record<number, PlayerData>;
  alliances: number[][];
  gameSpeed: number;
  map: GameMap;
}

export type EngineCommand = [string, Record<string, any>?];

export enum RenderType {}

export enum MovementDirection {
  none,
  n,
  ne,
  e,
  se,
  s,
  sw,
  w,
  nw,
}

export const vectorToDirectionEnum = (vec: VecIsoType): MovementDirection => {
  if (vec.i === 0 && vec.j < 0) {
    return MovementDirection.n;
  }
  if (vec.i === 0 && vec.j > 0) {
    return MovementDirection.s;
  }
  if (vec.i < 0 && vec.j === 0) {
    return MovementDirection.w;
  }
  if (vec.i > 0 && vec.j === 0) {
    return MovementDirection.e;
  }
  if (vec.i < 0 && vec.j < 0) {
    return MovementDirection.nw;
  }
  if (vec.i > 0 && vec.j < 0) {
    return MovementDirection.ne;
  }
  if (vec.i < 0 && vec.j > 0) {
    return MovementDirection.sw;
  }
  if (vec.i > 0 && vec.j > 0) {
    return MovementDirection.se;
  }
  return MovementDirection.none;
};

export const VecIso = { i: Types.f32, j: Types.f32 };
export const MovementData = { speed: Types.f32, direction: Types.ui8 };

export const Renderable = defineComponent();
export const Movable = defineComponent(MovementData);
export const Position = defineComponent(VecIso);
export const PathFindingTarget = defineComponent(VecIso);
export const PathFindingPath = defineComponent({ currentIndex: Types.ui32 });
export const Health = defineComponent({ health: Types.f32 });
export const Owner = defineComponent({ player: Types.ui8 });
export const RenderableBody = defineComponent({
  bodyIndex: Types.ui32,
  currentFrame: Types.ui32,
  lastFrameTime: Types.ui32,
});
export const RenderableBuilding = defineComponent({ buildingIndex: Types.ui32 });
export const SelectableGroupable = defineComponent();
export const SelectableSingle = defineComponent();

export const renderableQuery = defineQuery([Renderable, Position]);

const timeSystem = defineSystem((world: World) => {
  const now = performance.now();
  const delta = now - world.time.then;
  world.time.delta = delta;
  world.time.deltaS = delta / 1000;
  world.time.elapsed += delta;
  world.time.then = now;
  return world;
});

export class Engine {
  map: GameMap;
  world: World;
  systems: System<[], World>[];

  constructor(additionalSystems?: System<[], World>[]) {
    this.map = new GameMap(400);
    this.world = createWorld();
    this.world.time = {
      deltaS: 0,
      delta: 0,
      elapsed: 0,
      then: performance.now(),
    };
    this.world.gameSpeed = 1;
    this.world.map = this.map;
    this.world.playerData = { 0: { goods: { gold: 0, iron: 0, stone: 0, wood: 0 } } };
    this.world.alliances = [[0]];

    this.systems = [timeSystem, createPathFindingSystem(this.map), ...(additionalSystems ?? [])];
  }

  addSystem(...sys: System<[], World>[]): void {
    this.systems.push(...sys);
  }

  executeCommand(command: EngineCommand): void {}

  tick(): void {
    this.systems.forEach((sys) => sys(this.world));
  }

  newEntity(components: Component[]): number {
    const eid = addEntity(this.world);
    components.forEach((comp) => addComponent(this.world, comp, eid));
    return eid;
  }
}
