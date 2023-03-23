import { addComponent, defineQuery, removeComponent, System } from 'bitecs';
import { bodyCollection } from '../../data/body';
import { buildingCollection } from '../../data/building';
import {
  RenderableBody,
  Engine,
  Movable,
  PathFindingTarget,
  Position,
  Renderable,
  World,
  SelectableGroupable,
  SelectableSingle,
  RenderableBuilding,
  Health,
} from '../engine';
import { Vec2, VecIso } from '../types';
import { FrontendEvents } from './events';
import { BrowserFrontendMath } from './math';
import { Renderer } from './renderer';

const intersectsAABB = (point: Vec2, a: Vec2, b: Vec2): boolean => {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
};

export class BrowserFrontend {
  private readonly renderer: Renderer;

  private mouseActionState?: [any, any?];
  private selectedEids: number[] = [];

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(this.canvas);
  }

  public static async load(): Promise<void> {
    await Renderer.load();
  }

  private createSystems(): System<[], World>[] {
    return this.renderer.createRenderSystems();
  }

  startEngine(engine: Engine): void {
    engine.addSystem(...this.createSystems());
    this.renderer.render(engine.map);
    engine.tick();
    const events = new FrontendEvents(this.renderer, this.canvas);

    events.addListener('drag', (event) => {
      this.renderer.showSelectionRectangle(event.start.sprite, event.current.sprite);
    });
    events.addListener('dragEnd', (event) => {
      const selectedGroupEids = defineQuery([SelectableGroupable, Position])(engine.world).filter((eid) => {
        const positionIso: VecIso = { i: Position.i[eid], j: Position.j[eid] };
        const positionSprite = this.renderer.isoToScreenPosition(positionIso);
        return intersectsAABB(positionSprite, event.start.sprite, event.current.sprite);
      });
      this.selectedEids = selectedGroupEids;
      this.renderer.hideSelectionRectangle();
    });

    events.addListener('click', (mousePos) => {
      const iso = mousePos.iso;
      const snapped = BrowserFrontendMath.snapMapPosition(iso);
      if (this.mouseActionState?.[0] === 'place') {
        const eid = engine.newEntity([Position, Movable, Renderable, RenderableBody, SelectableGroupable, Health]);
        const bodyIndex = 0;
        const body = bodyCollection[bodyIndex];
        Movable.speed[eid] = body.movementSpeed;
        RenderableBody.bodyIndex[eid] = bodyIndex;
        Position.i[eid] = snapped.i;
        Position.j[eid] = snapped.j;
        Health.health[eid] = body.health;
      }

      if (this.mouseActionState?.[0] === 'moveTo' && this.selectedEids.length > 0) {
        this.selectedEids.forEach((eid) => {
          removeComponent(engine.world, PathFindingTarget, eid);
          addComponent(engine.world, PathFindingTarget, eid);
          PathFindingTarget.i[eid] = snapped.i;
          PathFindingTarget.j[eid] = snapped.j;
        });
      }

      if (this.mouseActionState?.[0] === 'build') {
        const eid = engine.newEntity([Position, Renderable, RenderableBuilding, SelectableSingle, Health]);
        const buildingIndex = 1;
        const building = buildingCollection[buildingIndex];
        Position.i[eid] = snapped.i;
        Position.j[eid] = snapped.j;
        RenderableBuilding.buildingIndex[eid] = buildingIndex;
        Health.health[eid] = building.health;
        console.log(building, snapped);
      }
    });

    this.renderer.app.ticker.add(() => engine.tick());

    this.renderer.app.ticker.add(() => {
      const speed = 10;
      const center = this.renderer.viewport.center.clone();
      let deltaX = 0;
      let deltaY = 0;

      if (events.isKeyPressed('ArrowUp')) {
        deltaY -= speed;
      }
      if (events.isKeyPressed('ArrowDown')) {
        deltaY += speed;
      }
      if (events.isKeyPressed('ArrowRight')) {
        deltaX += speed;
      }
      if (events.isKeyPressed('ArrowLeft')) {
        deltaX -= speed;
      }
      if (deltaX !== 0 || deltaY !== 0) {
        center.x += deltaX;
        center.y += deltaY;
        this.renderer.viewport.moveCenter(center);
        this.renderer.viewport.emit('moved', { viewport: this.renderer.viewport, type: 'keyboard' });
      }
    });
  }

  setMouseActionState(action: any, data?: any): void {
    this.mouseActionState = [action, data];
  }
}
