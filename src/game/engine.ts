import { Application } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { Renderer } from './renderer';
import { GameMap } from '../game-map';

export type EngineCommand = [string, Record<string, any>?];

export class Engine {
  app: Application;
  renderer!: Renderer;
  map!: GameMap;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application({
      antialias: false,
      resolution: 1,
      resizeTo: window,
      view: canvas,
    });

    this.canvas.style.imageRendering = 'pixelated';
  }

  async load(): Promise<void> {
    await Renderer.load();
  }

  async init(): Promise<void> {
    this.map = new GameMap(200);
    this.renderer = new Renderer(this.app);
    this.renderer.render(this.map);
  }

  executeCommand(command: EngineCommand): void {}
}
