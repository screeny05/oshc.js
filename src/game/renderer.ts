import { Viewport } from 'pixi-viewport';
import { Application, Container, Texture } from 'pixi.js';
import loader from './loader';
import { Vec2, VecIso } from './types';
import { GameMap } from '../game-map';
import { CompositeTilemap, settings } from '@pixi/tilemap';

settings.use32bitIndex = true;

const TILE_WIDTH = 30;
const TILE_HEIGHT = 16;
const UI_BOTTOM_BAR_HEIGHT = 128;

const cartesianToIso = (vec2: Vec2): VecIso => ({
  i: vec2.x + vec2.y,
  j: vec2.y - vec2.x,
});

const isoToCartesian = (vecIso: VecIso): Vec2 => ({
  x: (vecIso.i - vecIso.j) / 2,
  y: (vecIso.i + vecIso.j) / 2,
});

export class Renderer {
  private mapContainer!: Container;
  private tileContainer!: CompositeTilemap;
  private decalContainer!: Container;
  private entityContainer!: Container;
  private viewport!: Viewport;

  private mapOffsetX = 0;
  private mapOffsetY = 0;

  private get textures(): Record<string, Texture> {
    return loader.textures;
  }

  constructor(private readonly app: Application) {
    this.mapContainer = new Container();
    this.tileContainer = new CompositeTilemap();
    this.decalContainer = new Container();
    this.entityContainer = new Container();
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
    await loader.loadSpritesheet('tile_buildings2');
  }

  init(): void {}

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

  private floorViewport(): void {
    // This makes sure we never move to subpixel numbers (prevents blurry rendering)
    this.viewport.position.set(
      Math.floor(this.viewport.x),
      Math.floor(this.viewport.y)
    );
  }

  placeTile(mapPos: VecIso, spritesheet: string, index: number): void {
    const texture = this.textures[spritesheet + index];
    const tileOffsetY = texture.height - TILE_HEIGHT;
    const tileOffsetX = TILE_WIDTH / 2;
    const screenPos = isoToCartesian(mapPos);

    this.tileContainer.addFrame(
      texture,
      (screenPos.x + this.mapOffsetX) * TILE_WIDTH - tileOffsetX,
      (screenPos.y + this.mapOffsetY) * TILE_HEIGHT - tileOffsetY
    );
  }
}
