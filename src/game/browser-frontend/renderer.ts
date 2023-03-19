import { Viewport } from 'pixi-viewport';
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import loader from './loader';
import { Vec2, VecIso } from '../types';
import { GameMap } from '../../game-map';
import { CompositeTilemap, settings } from '@pixi/tilemap';
import { BrowserFrontendMath } from './math';
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from 'bitecs';
import { RenderableBody, Position, Renderable, renderableQuery, World, MovementData, MovementDirection, Movable } from '../engine';
import { bodyCollection, Body } from '../../data/body';
import { Gm1 } from '../../sprites/data-parser';
import { AnimationDescriptor, AnimationSet, animationSetArabGrenadier } from '../../data/animation-set';

settings.use32bitIndex = true;

const TILE_WIDTH = 30;
const TILE_HEIGHT = 16;
const UI_BOTTOM_BAR_HEIGHT = 128;

const DEBUG_ENTITY_POSITION = false;

interface EntityRenderable {
  container: Container;
}

export class Renderer {
  public app: Application;

  private mapContainer: Container;
  private tileContainer: CompositeTilemap;
  private decalContainer: Container;
  private entityContainer: Container;
  private viewport: Viewport;

  private mapOffsetX = 0;
  private mapOffsetY = 0;
  private renderablesByEid: Map<number, EntityRenderable> = new Map();

  private get textures(): Record<string, Texture> {
    return loader.textures;
  }

  private get gm1s(): Record<string, Gm1> {
    return loader.gm1s;
  }

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.app = new Application({
      antialias: false,
      resolution: 1,
      resizeTo: window,
      view: canvas,
    });
    this.canvas.style.imageRendering = 'pixelated';

    this.tileContainer = new CompositeTilemap();
    this.decalContainer = new Container();
    this.entityContainer = new Container();
    this.mapContainer = new Container();
    this.viewport = new Viewport({
      passiveWheel: true,
    });

    this.tileContainer.interactive = false;
    this.tileContainer.interactiveChildren = false;

    this.mapContainer.addChild(this.tileContainer);
    this.mapContainer.addChild(this.decalContainer);
    this.mapContainer.addChild(this.entityContainer);
    this.viewport.addChild(this.mapContainer);
    this.app.stage.addChild(this.viewport);
  }

  public static async load(): Promise<void> {
    await loader.loadSpritesheet('tile_data');
    await loader.loadSpritesheet('tile_buildings1');
    await loader.loadSpritesheet('tile_buildings2');
    await loader.loadSpritesheet('body_arab_grenadier');
  }

  render(map: GameMap): void {
    this.mapOffsetX = 0.25 * (map.size - (map.size % 2)) + 0.5; // In tiles unit
    this.mapOffsetY = -0.5 * Math.floor((map.size - 1) / 2);

    map.forEachTile((tile, mapPos) => {
      this.placeTile(mapPos, 'tile_data', tile);
    });

    this.viewport
      .drag()
      .mouseEdges({ distance: 20 })
      .clamp({
        underflow: 'center',
        top: TILE_HEIGHT / 2,
        bottom: this.viewport.worldHeight - TILE_HEIGHT / 2 + UI_BOTTOM_BAR_HEIGHT,
        left: TILE_WIDTH / 2,
        right: this.viewport.worldWidth - TILE_WIDTH / 2,
      })
      .addListener('moved', () => this.floorViewport());
    this.floorViewport();
  }

  public createRenderSystems(): System<[], World>[] {
    return [this.createSpriteRenderSystem(), this.createBodyRenderSystem()];
  }

  private createBodyRenderSystem(): System<[], World> {
    const query = defineQuery([Renderable, RenderableBody]);
    const queryEnter = enterQuery(query);

    const getNextFrame = (currentFrame: number, animation: AnimationDescriptor): number => {
      const endFrame = animation.offset + (animation.frames - 1) * animation.increment;
      const nextFrame = currentFrame + animation.increment;
      const isInCurrentAnimationStep = (nextFrame - animation.offset) % animation.increment === 0;
      console.log(animation.offset, currentFrame, nextFrame, endFrame);
      if (nextFrame > endFrame || nextFrame < animation.offset || !isInCurrentAnimationStep) {
        return animation.offset;
      }
      return nextFrame;
    };

    const getCurrentAnimation = (direction: MovementDirection, body: Body): AnimationDescriptor => {
      if (direction === MovementDirection.n) {
        return body.frames.moveN;
      }
      if (direction === MovementDirection.ne) {
        return body.frames.moveNE;
      }
      if (direction === MovementDirection.e) {
        return body.frames.moveE;
      }
      if (direction === MovementDirection.se) {
        return body.frames.moveSE;
      }
      if (direction === MovementDirection.s) {
        return body.frames.moveS;
      }
      if (direction === MovementDirection.sw) {
        return body.frames.moveSW;
      }
      if (direction === MovementDirection.w) {
        return body.frames.moveW;
      }
      if (direction === MovementDirection.nw) {
        return body.frames.moveNW;
      }
      return body.frames.idle;
    };

    return defineSystem((world) => {
      const entitiesEntered = queryEnter(world);
      entitiesEntered.forEach((eid) => {
        const body = bodyCollection[RenderableBody.bodyIndex[eid]];
        const currentFrame = body.frames.idle.offset;
        RenderableBody.currentFrame[eid] = currentFrame;
        RenderableBody.lastFrameTime[eid] = world.time.elapsed;
      });

      query(world).forEach((eid) => {
        const renderable = this.renderablesByEid.get(eid);
        const container = renderable?.container;
        const sprite = container?.children[0] as Sprite;
        const body = bodyCollection[RenderableBody.bodyIndex[eid]];
        const frameOffsets = this.gm1s[body.spritesheet].animations;
        const currentAnimation = getCurrentAnimation(Movable.direction[eid], body);
        const currentFrame = RenderableBody.currentFrame[eid];
        const lastFrameTime = RenderableBody.lastFrameTime[eid];
        const currentTime = world.time.elapsed;
        const timePerFrame = 1000 / currentAnimation.fps / world.gameSpeed;

        if (!container) {
          return;
        }

        //sprite.texture = this.textures[body.spritesheet + currentFrame];
        //sprite.texture = this.textures['tile_data22'];

        if (currentTime > lastFrameTime + timePerFrame) {
          const nextFrame = getNextFrame(currentFrame, currentAnimation);
          const frameOffset = frameOffsets?.[nextFrame];
          sprite.texture = this.textures[body.spritesheet + nextFrame];

          RenderableBody.currentFrame[eid] = nextFrame;
          RenderableBody.lastFrameTime[eid] = currentTime;

          if (frameOffset) {
            // x / 2 because the anchor is bottom center
            const x = sprite.texture.width * 0.5 - frameOffset.centerX;
            const y = -frameOffset.centerY - TILE_HEIGHT * 0.5;
            //sprite.anchor.set(0.5, 1);
            console.log({ x, y });
            sprite.position.set(x, y);
          }
        }
      });
      return world;
    });
  }

  private createSpriteRenderSystem(): System<[], World> {
    const queryEnter = enterQuery(renderableQuery);
    const queryExit = exitQuery(renderableQuery);

    const addDebugRectangle = (container: Container): void => {
      if (!DEBUG_ENTITY_POSITION) {
        return;
      }
      const gra = new Graphics();
      gra.beginFill(0xff00ff);
      gra.lineStyle(1, 0xff0000);
      gra.drawRect(0, 0, 1, 1);
      container.addChild(gra);
    };

    return defineSystem((world) => {
      const entitiesEntered = queryEnter(world);
      entitiesEntered.forEach((eid) => {
        const container = new Container();
        const sprite = new Sprite();
        sprite.anchor.set(0.5, 0);
        container.addChild(sprite);
        this.renderablesByEid.set(eid, { container });
        this.entityContainer.addChild(container);
        addDebugRectangle(container);
      });

      const entities = renderableQuery(world);
      entities.forEach((eid) => {
        const renderable = this.renderablesByEid.get(eid);
        if (!renderable) {
          return;
        }
        this.moveTo(renderable.container, {
          i: Position.i[eid],
          j: Position.j[eid],
        });

        // TODO z-ordering
      });

      const entitiesExited = queryExit(world);
      entitiesExited.forEach((eid) => {
        const renderable = this.renderablesByEid.get(eid);
        if (!renderable) {
          return;
        }
        this.entityContainer.removeChild(renderable.container);
        this.renderablesByEid.delete(eid);
      });
      return world;
    });
  }

  private floorViewport(): void {
    // This makes sure we never move to subpixel numbers (prevents blurry rendering)
    this.viewport.position.set(Math.floor(this.viewport.x), Math.floor(this.viewport.y));
  }

  public screenPositionToMapPosition(pos: Vec2): VecIso {
    const worldPos = this.viewport.toWorld(pos.x, pos.y);
    return BrowserFrontendMath.cartesianToIso({
      x: worldPos.x / TILE_WIDTH - this.mapOffsetX,
      y: worldPos.y / TILE_HEIGHT - this.mapOffsetY,
    });
  }

  public isoToScreenPosition(iso: VecIso, tileOffsetX: number = 0, tileOffsetY: number = 0): Vec2 {
    const cartesian = BrowserFrontendMath.isoToCartesian(iso);
    return {
      x: (cartesian.x + this.mapOffsetX) * TILE_WIDTH - tileOffsetX,
      y: (cartesian.y + this.mapOffsetY) * TILE_HEIGHT - tileOffsetY,
    };
  }

  placeTile(mapPos: VecIso, spritesheet: string, index: number): void {
    const texture = this.textures[spritesheet + index];
    const tileOffsetX = TILE_WIDTH / 2;
    const tileOffsetY = texture.height - TILE_HEIGHT;
    const screenPos = this.isoToScreenPosition(mapPos, tileOffsetX, tileOffsetY);

    this.tileContainer.addFrame(texture, screenPos.x, screenPos.y);
  }

  moveTo(container: Container, mapPos: VecIso): void {
    const containerOffsetY = -TILE_HEIGHT;
    const containerOffsetX = 0;
    const screenPos = this.isoToScreenPosition(mapPos, containerOffsetX, containerOffsetY);

    container.position.set(screenPos.x, screenPos.y);
  }
}
