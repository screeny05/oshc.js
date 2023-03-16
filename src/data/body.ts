export interface Animation {
  startFrame: number;
  endFrame: number;
  speed: number;
}

export interface BodyFrames {
  idle: Animation;
  hitByArrow?: Animation;
}

export interface Body {
  frames: BodyFrames;
  movementSpeed: number;
}
