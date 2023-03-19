import { addComponent } from 'bitecs';
import { bodyCollection } from '../../data/body';
import { RenderableBody, Engine, Movable, PathFindingTarget, Position, Renderable } from '../engine';
import { BrowserFrontendMath } from './math';
import { Renderer } from './renderer';

export class BrowserFrontend {
  private readonly renderer: Renderer;
  private readonly engine: Engine;

  private currentAction?: [any, any?];
  private eid: number | undefined;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(this.canvas);
    this.engine = new Engine(this.renderer.createRenderSystems());
  }

  public static async load(): Promise<void> {
    await Renderer.load();
  }

  render(): void {
    this.renderer.render(this.engine.map);
    this.engine.tick();

    this.canvas.addEventListener('click', (event) => {
      const iso = this.renderer.screenPositionToMapPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const snapped = BrowserFrontendMath.snapMapPosition(iso);

      if (this.eid === undefined && this.currentAction?.[0] === 'place') {
        this.eid = this.engine.newEntity([Position, Movable, Renderable, RenderableBody]);
        const bodyIndex = 0;
        const body = bodyCollection[bodyIndex];
        Movable.speed[this.eid] = body.movementSpeed;
        Renderable.frame[this.eid] = 0;
        Renderable.index[this.eid] = 10;
        RenderableBody.bodyIndex[this.eid] = bodyIndex;
      }

      if (this.eid !== undefined && this.currentAction?.[0] === 'place') {
        Position.i[this.eid] = snapped.i;
        Position.j[this.eid] = snapped.j;
      }

      if (this.eid !== undefined && this.currentAction?.[0] === 'moveTo') {
        addComponent(this.engine.world, PathFindingTarget, this.eid);
        PathFindingTarget.i[this.eid] = snapped.i;
        PathFindingTarget.j[this.eid] = snapped.j;
      }
    });

    this.renderer.app.ticker.add(() => this.engine.tick());
  }

  setMouseAction(action: any, data?: any): void {
    this.currentAction = [action, data];
  }
}
