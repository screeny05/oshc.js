import EventEmitter from 'eventemitter3';
import { Vec2, VecIso } from '../types';
import { Renderer } from './renderer';
import { EventLifecycleManager } from './event-lifecycle-manager';

const MOUSE_DRAG_THRESHOLD_IN_MS = 120;
const MOUSE_DRAG_THRESHOLD_IN_DISTANCE = 30;

interface FrontendMousePosition {
  screen: Vec2;
  sprite: Vec2;
  iso: VecIso;
}

interface FrontendDragEvent {
  start: FrontendMousePosition;
  current: FrontendMousePosition;
}

interface FrontendEventTypes {
  mouseDown: (args: FrontendMousePosition) => void;
  mouseMove: (args: FrontendMousePosition) => void;
  mouseUp: (args: FrontendMousePosition) => void;
  click: (args: FrontendMousePosition) => void;
  drag: (args: FrontendDragEvent) => void;
  dragEnd: (args: FrontendDragEvent) => void;
  keyDown: (event: KeyboardEvent) => void;
  keyUp: (event: KeyboardEvent) => void;
}

const vec2Identity: Vec2 = { x: 0, y: 0 };
const vecIsoIdentity: VecIso = { i: 0, j: 0 };

export class FrontendEvents extends EventEmitter<FrontendEventTypes> {
  private eventManager = new EventLifecycleManager();
  private pressedKeys: Record<KeyboardEvent['code'], boolean> = {};

  public mousePos: FrontendMousePosition = { iso: vecIsoIdentity, screen: vec2Identity, sprite: vec2Identity };
  public mouseDownPos?: FrontendMousePosition;
  public mouseDownTime: number = performance.now();
  public isMouseDown: boolean = false;
  public isMouseDragging: boolean = false;

  constructor(private readonly renderer: Renderer, private readonly canvas: HTMLCanvasElement) {
    super();

    this.eventManager.add(this.canvas, 'pointerdown', this.onPointerDown.bind(this));
    this.eventManager.add(this.canvas, 'pointermove', this.onPointerMove.bind(this));
    this.eventManager.add(this.canvas, 'pointerup', this.onPointerUp.bind(this));
    this.eventManager.add(window.document.documentElement, 'keydown', this.onKeyDown.bind(this));
    this.eventManager.add(window.document.documentElement, 'keyup', this.onKeyUp.bind(this));
    this.eventManager.add(this.renderer.viewport, 'moved', this.onViewportMoved.bind(this));
  }

  public destroy(): void {
    this.eventManager.removeAll();
  }

  public isKeyPressed(code: string): boolean {
    return this.pressedKeys[code] === true;
  }

  private pointerEventToPosition(event: PointerEvent): FrontendMousePosition {
    const posScreen = { x: event.clientX, y: event.clientY };
    return {
      screen: posScreen,
      iso: this.renderer.screenPositionToMapPosition(posScreen),
      sprite: this.renderer.screenPositionToSpritePosition(posScreen),
    };
  }

  private onPointerDown(event: PointerEvent): void {
    this.mousePos = this.pointerEventToPosition(event);
    this.mouseDownPos = this.mousePos;
    this.mouseDownTime = performance.now();
    this.isMouseDown = true;
    this.isMouseDragging = false;

    // TODO check if mouse-edge viewport moving is working while dragging in original game
    this.canvas.setPointerCapture(event.pointerId);

    this.emit('mouseDown', this.mouseDownPos);
  }

  private onPointerMove(event: PointerEvent): void {
    this.mousePos = this.pointerEventToPosition(event);
    const timeSinceMouseDown = performance.now() - this.mouseDownTime;
    const moveDeltaX = this.mouseDownPos ? Math.abs(this.mouseDownPos.sprite.x - this.mousePos.sprite.x) : 0;
    const moveDeltaY = this.mouseDownPos ? Math.abs(this.mouseDownPos.sprite.y - this.mousePos.sprite.y) : 0;

    this.emit('mouseMove', this.mousePos);

    if (
      this.mouseDownPos &&
      this.isMouseDown &&
      (timeSinceMouseDown >= MOUSE_DRAG_THRESHOLD_IN_MS ||
        moveDeltaX > MOUSE_DRAG_THRESHOLD_IN_DISTANCE ||
        moveDeltaY > MOUSE_DRAG_THRESHOLD_IN_DISTANCE)
    ) {
      this.isMouseDragging = true;

      this.emit('drag', {
        start: this.mouseDownPos,
        current: this.mousePos,
      });
    }
  }

  private onPointerUp(event: PointerEvent): void {
    this.isMouseDown = false;
    this.canvas.releasePointerCapture(event.pointerId);

    this.emit('mouseUp', this.mousePos);

    if (this.isMouseDragging) {
      this.isMouseDragging = false;
      this.emit('dragEnd', {
        start: this.mouseDownPos!,
        current: this.mousePos,
      });
      return;
    }

    this.emit('click', this.mousePos);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const alreadyPressed = this.pressedKeys[event.code];

    this.pressedKeys[event.code] = true;

    // Ensure keyDown-events are only fired once
    if (!alreadyPressed) {
      this.emit('keyDown', event);
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.pressedKeys[event.code] = false;
    this.emit('keyUp', event);
  }

  private onViewportMoved(): void {
    this.mousePos.sprite = this.renderer.screenPositionToSpritePosition(this.mousePos.screen);
    this.mousePos.iso = this.renderer.screenPositionToMapPosition(this.mousePos.screen);
    this.emit('mouseMove', this.mousePos);

    if (this.isMouseDragging) {
      this.emit('drag', {
        start: this.mouseDownPos!,
        current: this.mousePos,
      });
    }
  }
}
