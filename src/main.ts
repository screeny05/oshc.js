import * as PIXI from 'pixi.js';
import { Sprite, Spritesheet } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import SheetData from '../public/tiles/tile_land3.json';
import { GameMap } from './game-map';
import * as ReactDOM from 'react-dom/client';
import { gameUi } from './components/game-ui';
import loadSpritesheetData from './sprites/data-loader';
import { spritesheetDataToPixi } from './sprites/data-to-pixi';

/*const load = async (app: PIXI.Application): Promise<void> => {
  app.loader
    .add('tilesFloorDry1', 'assets/tiles/floor-dry-1.png')
    .add('tilesFloorDry2', 'assets/tiles/floor-dry-2.png');
  return new Promise((r) => app.loader.load(() => r()));
};*/

const SIZE = 130;
const BORDER_OFFSET = 0.5;
const OFFSET_X = 0.25 * (SIZE - (SIZE % 2)) - BORDER_OFFSET + 0.5; // In tiles unit
const OFFSET_Y = 0.5 * Math.floor((SIZE - 1) / 2) + BORDER_OFFSET;
const TILE_WIDTH = 30;
const TILE_HEIGHT = 16;
const ASPECT_RATIO = TILE_WIDTH / TILE_HEIGHT;

const cartesianToIso = (x: number, y: number): { x: number; y: number } => ({
  x: (x - y) / 2,
  y: (x + y) / 2,
});

const isoToCartesian = (x: number, y: number): { x: number; y: number } => ({
  x: x + y,
  y: y - x,
});

const cartesianSnapToGrid = (
  x: number,
  y: number
): { x: number; y: number } => ({
  x: Math.floor(x / TILE_WIDTH) * TILE_WIDTH,
  y: Math.floor(y / TILE_HEIGHT) * TILE_HEIGHT,
});

const $canvasContainer = document.querySelector('#canvas-container')!;
const $uiContainer = document.querySelector('#ui-container')!;

const main = async () => {
  // Main app
  const app = new PIXI.Application({
    antialias: false,
    resolution: 1,
    resizeTo: window,
  });
  const $canvas = app.view as unknown as HTMLCanvasElement;
  $canvasContainer.appendChild($canvas);
  $canvas.style.imageRendering = 'pixelated';
  ReactDOM.createRoot($uiContainer).render(gameUi());

  const tileData = await loadSpritesheetData('tile_data');
  const buildingData = await loadSpritesheetData('tile_buildings2');
  const spriteTiles = PIXI.Sprite.from('/orgx/gm/tile_data.png');
  const spriteBuildings = PIXI.Sprite.from('/orgx/gm/tile_buildings2.png');

  const tiles = new Spritesheet(
    spriteTiles.texture,
    spritesheetDataToPixi('tile_data', tileData.slice(0, 64))
  );
  const buildings = new Spritesheet(
    spriteBuildings.texture,
    spritesheetDataToPixi('tile_buildings2', buildingData)
  );

  await tiles.parse();
  await buildings.parse();

  const map = new GameMap(SIZE);

  const mapContainer = new PIXI.Container();
  const tileContainer = new PIXI.Container();
  const decalContainer = new PIXI.Container();
  const entityContainer = new PIXI.Container();
  const viewport = new Viewport({ events: app.renderer.events });

  mapContainer.addChild(tileContainer);
  mapContainer.addChild(decalContainer);
  mapContainer.addChild(entityContainer);
  viewport.addChild(mapContainer);
  app.stage.addChild(viewport);

  viewport.drag().decelerate();

  const placeAt = (
    cX: number,
    cY: number,
    texture = tiles.textures['tile_data1']
  ) => {
    const sprite = PIXI.Sprite.from(texture ?? tiles.textures['tile_data1']);
    moveTo(cX, cY, sprite);

    tileContainer.addChild(sprite);
  };

  const moveTo = (cX: number, cY: number, sprite: PIXI.Sprite) => {
    // Offset the y axis for sprites that are not just flat tiles
    const offsetY = sprite.height - TILE_HEIGHT;
    const iPos = cartesianToIso(cX, cY);
    sprite.anchor.set(0.5, 0);
    sprite.position.set(
      (iPos.x + OFFSET_X) * TILE_WIDTH,
      (iPos.y - OFFSET_Y) * TILE_HEIGHT - offsetY
    );
  };

  map.forEachTile((tile, pos, index) => {
    const spriteIndex = tile; //index % Object.keys(tiles.textures).length;
    placeAt(pos.i, pos.j, tiles.textures['tile_data' + spriteIndex]);
  });

  const highlightSprite = new PIXI.Sprite(tiles.textures['tile_data0']);
  app.stage.addChild(highlightSprite);

  $canvas.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const iso = isoToCartesian(
      mouseX / TILE_WIDTH - OFFSET_X,
      mouseY / TILE_HEIGHT + OFFSET_Y
    );
    const snapped = { x: Math.floor(iso.x), y: Math.floor(iso.y) };

    moveTo(snapped.x, snapped.y, highlightSprite);
  });

  $canvas.addEventListener('click', (event) => {
    const iso = isoToCartesian(
      event.clientX / TILE_WIDTH - OFFSET_X,
      event.clientY / TILE_HEIGHT + OFFSET_Y
    );
    const snapped = { x: Math.floor(iso.x), y: Math.floor(iso.y) };
    console.log(
      snapped,
      map.at(snapped.x, snapped.y),
      map.math.getPositionByIndex(
        map.math.getIndexByPosition(snapped.x, snapped.y)
      )
    );

    // TODO: Sort by z-value
    placeAt(
      snapped.x,
      snapped.y,
      buildings.textures[
        'tile_buildings2' +
          Math.round(Math.random() * Object.keys(buildings.textures).length)
      ]
    );
  });

  app.ticker.add(() => (app.stage.transform.position.x -= 0.1));
};

const worldSpaceToGrid = (x: number | { x: number; y: number }, y?: number) => {
  y = typeof x === 'object' ? x.y : y!;
  x = typeof x === 'object' ? x.x : x;
  return {
    x: x / TILE_WIDTH,
    y: y / TILE_HEIGHT,
  };
};

//main();

ReactDOM.createRoot($uiContainer).render(gameUi());
