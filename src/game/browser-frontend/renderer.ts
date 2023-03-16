import { Viewport } from 'pixi-viewport';
import { Application, Container, Sprite, Texture } from 'pixi.js';
import loader from './loader';
import { Vec2, VecIso } from '../types';
import { GameMap } from '../../game-map';
import { CompositeTilemap, settings } from '@pixi/tilemap';
import { BrowserFrontendMath } from './math';
import { defineSystem, enterQuery, exitQuery, System } from 'bitecs';
import { Position, renderableQuery, World } from '../engine';

settings.use32bitIndex = true;

const TILE_WIDTH = 30;
const TILE_HEIGHT = 16;
const UI_BOTTOM_BAR_HEIGHT = 128;

export class Renderer {
  public app: Application;

  private mapContainer: Container;
  private tileContainer: CompositeTilemap;
  private decalContainer: Container;
  private entityContainer: Container;
  private viewport: Viewport;

  private mapOffsetX = 0;
  private mapOffsetY = 0;
  private spritesByEid: Map<number, Sprite> = new Map();

  private get textures(): Record<string, Texture> {
    return loader.textures;
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
        bottom:
          this.viewport.worldHeight - TILE_HEIGHT / 2 + UI_BOTTOM_BAR_HEIGHT,
        left: TILE_WIDTH / 2,
        right: this.viewport.worldWidth - TILE_WIDTH / 2,
      })
      .addListener('moved', () => this.floorViewport());
    this.floorViewport();
  }

  public createRenderSystem(): System<[], World> {
    const queryEnter = enterQuery(renderableQuery);
    const queryExit = exitQuery(renderableQuery);

    return defineSystem((world) => {
      const entitiesEntered = queryEnter(world);
      entitiesEntered.forEach((eid) => {
        const sprite = new Sprite(this.textures['tile_buildings1' + 0]);
        sprite.anchor.set(0.5, 0);
        this.spritesByEid.set(eid, sprite);
        this.entityContainer.addChild(sprite);
      });

      const entities = renderableQuery(world);
      entities.forEach((eid) => {
        const sprite = this.spritesByEid.get(eid);
        if (!sprite) {
          return;
        }
        this.moveTo(sprite, { i: Position.i[eid], j: Position.j[eid] });

        // TODO z-ordering
      });

      const entitiesExited = queryExit(world);
      entitiesExited.forEach((eid) => {
        const sprite = this.spritesByEid.get(eid);
        if (!sprite) {
          return;
        }
        this.entityContainer.removeChild(sprite);
        this.spritesByEid.delete(eid);
      });
      return world;
    });
  }

  private floorViewport(): void {
    // This makes sure we never move to subpixel numbers (prevents blurry rendering)
    this.viewport.position.set(
      Math.floor(this.viewport.x),
      Math.floor(this.viewport.y)
    );
  }

  public screenPositionToMapPosition(pos: Vec2): VecIso {
    const worldPos = this.viewport.toWorld(pos.x, pos.y);
    return BrowserFrontendMath.cartesianToIso({
      x: worldPos.x / TILE_WIDTH - this.mapOffsetX,
      y: worldPos.y / TILE_HEIGHT - this.mapOffsetY,
    });
  }

  public isoToScreenPosition(
    iso: VecIso,
    tileOffsetX: number = 0,
    tileOffsetY: number = 0
  ): Vec2 {
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
    const screenPos = this.isoToScreenPosition(
      mapPos,
      tileOffsetX,
      tileOffsetY
    );

    this.tileContainer.addFrame(texture, screenPos.x, screenPos.y);
  }

  moveTo(sprite: Sprite, mapPos: VecIso): void {
    const spriteOffsetY = sprite.height - TILE_HEIGHT;
    const spriteOffsetX = 0;
    const screenPos = this.isoToScreenPosition(
      mapPos,
      spriteOffsetX,
      spriteOffsetY
    );

    sprite.position.set(screenPos.x, screenPos.y);
  }
}
