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
import { I_NavigatorTile, Vector } from 'pulsar-pathfinding';
import { GameMap } from '../game-map';
import { BrowserFrontendMath } from './browser-frontend/math';

export interface World extends IWorld {
  time: {
    delta: number;
    elapsed: number;
    then: number;
  };
  map: GameMap;
}

export type EngineCommand = [string, Record<string, any>?];

export enum RenderType {}

export const VecIso = { i: Types.f32, j: Types.f32 };
export const MovementSpeed = { speed: Types.f32 };
export const RenderableData = { index: Types.ui16, frame: Types.ui16 };

export const Renderable = defineComponent(RenderableData);
export const Movable = defineComponent(MovementSpeed);
export const Position = defineComponent(VecIso);
export const PathFindingTarget = defineComponent(VecIso);
export const PathFindingPath = defineComponent({ currentIndex: Types.ui32 });
export const Health = defineComponent({ health: Types.f32 });
export const PlayerOwned = defineComponent({ player: Types.ui8 });

export const renderableQuery = defineQuery([Renderable, Position]);

const timeSystem = defineSystem((world: World) => {
  const now = performance.now();
  const delta = now - world.time.then;
  world.time.delta = delta / 1000;
  world.time.elapsed += delta;
  world.time.then = now;
  return world;
});

const targetQuery = defineQuery([PathFindingTarget]);
const movingQuery = defineQuery([Movable, PathFindingPath, Position]);

const pathfindingCache: Map<number, I_NavigatorTile[]> = new Map();

const pathFindingSystem = defineSystem((world: World) => {
  const enterTargetEntities = enterQuery(targetQuery)(world);
  enterTargetEntities.forEach((eid) => {
    world.map
      .getPath(
        { i: Position.i[eid], j: Position.j[eid] },
        {
          i: PathFindingTarget.i[eid],
          j: PathFindingTarget.j[eid],
        }
      )
      .then((path) => {
        addComponent(world, PathFindingPath, eid);
        PathFindingPath.currentIndex[eid] = 0;
        pathfindingCache.set(eid, path);
      });
  });

  movingQuery(world).forEach((eid) => {
    const path = pathfindingCache.get(eid);
    if (!path || path.length === 0) {
      pathfindingCache.delete(eid);
      removeComponent(world, PathFindingPath, eid);
      return;
    }

    const currentPosition = new Vector({
      x: Position.i[eid],
      y: Position.j[eid],
    });
    const currentTileIndex = {
      x: Math.floor(currentPosition.x),
      y: Math.floor(currentPosition.y),
    };

    const currentTile = world.map.grid.getTile(currentTileIndex);
    if (!currentTile) {
      return;
    }

    const previousTile =
      path[PathFindingPath.currentIndex[eid] - 1] ?? currentTile;
    const nextTile = path[PathFindingPath.currentIndex[eid]];

    const movement = nextTile.position
      .sub(currentPosition)
      .normalize()
      .multiplyScalar(0.1);
    const lerped = currentPosition.add(movement);
    const distanceToTarget = lerped.distanceTo(nextTile.position);
    Position.i[eid] = lerped.x;
    Position.j[eid] = lerped.y;

    if (distanceToTarget < 0.1) {
      Position.i[eid] = nextTile.position.x;
      Position.j[eid] = nextTile.position.y;
      PathFindingPath.currentIndex[eid] += 1;
    }

    if (PathFindingPath.currentIndex[eid] === path.length) {
      removeComponent(world, PathFindingPath, eid);
      removeComponent(world, PathFindingTarget, eid);
    }

    //Position.i[eid] += Movable.speed[eid] * world.time.delta;
    //Position.j[eid] += Movable.speed[eid] * world.time.delta;
    //removeComponent(world, PathFindingTarget, eid);
  });

  return world;
});

export class Engine {
  map: GameMap;
  world: World;

  constructor(private readonly renderSystem?: System<[], World>) {
    this.map = new GameMap(40);
    this.world = createWorld();
    this.world.time = {
      delta: 0,
      elapsed: 0,
      then: performance.now(),
    };
    this.world.map = this.map;
  }

  executeCommand(command: EngineCommand): void {}

  tick(): void {
    timeSystem(this.world);
    this.renderSystem?.(this.world);
    pathFindingSystem(this.world);
  }

  newEntity(components: Component[]): number {
    const eid = addEntity(this.world);
    components.forEach((comp) => addComponent(this.world, comp, eid));
    return eid;
  }
}
