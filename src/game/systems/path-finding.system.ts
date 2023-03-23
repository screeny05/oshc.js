import { defineSystem, System, addComponent, enterQuery, removeComponent, defineQuery } from 'bitecs';
import { World, MovementDirection, vectorToDirectionEnum, Movable, Position, PathFindingTarget, PathFindingPath } from '../engine';
import { GameMap } from '../../game-map';
import EasyStar from 'easystarjs';
import { Vec2 } from '../types';
import { vec2 } from 'gl-matrix';

const vec2MoveTowards = (out: vec2, start: vec2, end: vec2, step: number): void => {};

export const createPathFindingSystem = (map: GameMap): System<[], World> => {
  const targetQuery = defineQuery([PathFindingTarget]);
  const enterTargetQuery = enterQuery(targetQuery);
  const movingQuery = defineQuery([Movable, PathFindingPath, Position]);

  const easystar = new EasyStar.js();
  const pathCache = new Map<number, Vec2[]>();

  easystar.setGrid(map.collisionMap);
  easystar.setAcceptableTiles([0]);
  easystar.enableDiagonals();
  easystar.disableCornerCutting();

  return defineSystem((world: World) => {
    // Calculate paths for all new target-seeking entities
    // TODO: Cancel process when target changes or entity exits
    const targetSeeking = enterTargetQuery(world);
    targetSeeking.forEach((eid) => {
      easystar.findPath(
        Math.floor(Position.i[eid]),
        Math.floor(Position.j[eid]),
        PathFindingTarget.i[eid],
        PathFindingTarget.j[eid],
        (path) => {
          // If the entity is already on the target position, remove component
          if (!path || path.length === 0) {
            removeComponent(world, PathFindingPath, eid);
            removeComponent(world, PathFindingTarget, eid);
            return;
          }

          addComponent(world, PathFindingPath, eid);
          PathFindingPath.currentIndex[eid] = 0;
          pathCache.set(eid, path);
        }
      );
    });

    movingQuery(world).forEach((eid) => {
      const path = pathCache.get(eid);
      if (!path) {
        return;
      }

      const speed = Movable.speed[eid];
      const nextTile = path[PathFindingPath.currentIndex[eid]];
      const movementScale = world.time.deltaS * world.gameSpeed * speed;

      const currentPosition = vec2.fromValues(Position.i[eid], Position.j[eid]);
      const targetPosition = vec2.fromValues(nextTile.x, nextTile.y);
      const nextPosition = vec2.create();
      const currentToTarget = vec2.create();
      const movement = vec2.create();
      vec2.subtract(currentToTarget, targetPosition, currentPosition);
      vec2.normalize(movement, currentToTarget);
      vec2.scale(movement, movement, movementScale);

      // Limit movement to distance-vector. May look dumb if movement-speed is above 1 tile/tick
      if (movement[0] > 0 && movement[0] > currentToTarget[0]) {
        movement[0] = currentToTarget[0];
      }
      if (movement[0] < 0 && movement[0] < currentToTarget[0]) {
        movement[0] = currentToTarget[0];
      }
      if (movement[1] > 0 && movement[1] > currentToTarget[1]) {
        movement[1] = currentToTarget[1];
      }
      if (movement[1] < 0 && movement[1] < currentToTarget[1]) {
        movement[1] = currentToTarget[1];
      }
      // Use vec2MoveTowards

      vec2.add(nextPosition, currentPosition, movement);

      Position.i[eid] = nextPosition[0];
      Position.j[eid] = nextPosition[1];
      Movable.direction[eid] = vectorToDirectionEnum({ i: movement[0], j: movement[1] });

      const distanceToTarget = vec2.create();
      vec2.sub(distanceToTarget, targetPosition, nextPosition);
      if (Math.abs(distanceToTarget[0]) < 0.05 && Math.abs(distanceToTarget[1]) < 0.05) {
        Position.i[eid] = targetPosition[0];
        Position.j[eid] = targetPosition[1];
        PathFindingPath.currentIndex[eid] += 1;
      }

      if (PathFindingPath.currentIndex[eid] === path.length) {
        Movable.direction[eid] = MovementDirection.none;
        removeComponent(world, PathFindingPath, eid);
        removeComponent(world, PathFindingTarget, eid);
      }
    });

    easystar.calculate();

    return world;
  });
};
