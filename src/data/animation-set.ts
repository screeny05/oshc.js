export interface AnimationDescriptor {
  offset: number;
  frames: number;
  increment: number;
  fps: number;
}

export type AnimationSet = Record<string, AnimationDescriptor>;

export const animationSetArabGrenadier = {
  moveN: { offset: 0, increment: 8, frames: 16, fps: 20 },
  moveNE: { offset: 1, increment: 8, frames: 16, fps: 20 },
  moveE: { offset: 2, increment: 8, frames: 16, fps: 20 },
  moveSE: { offset: 3, increment: 8, frames: 16, fps: 20 },
  moveS: { offset: 4, increment: 8, frames: 16, fps: 20 },
  moveSW: { offset: 5, increment: 8, frames: 16, fps: 20 },
  moveW: { offset: 6, increment: 8, frames: 16, fps: 20 },
  moveNW: { offset: 7, increment: 8, frames: 16, fps: 20 },
  attackN: { offset: 128, increment: 8, frames: 24, fps: 20 },
  attackNE: { offset: 129, increment: 8, frames: 24, fps: 20 },
  attackE: { offset: 130, increment: 8, frames: 24, fps: 20 },
  attackSE: { offset: 131, increment: 8, frames: 24, fps: 20 },
  attackS: { offset: 132, increment: 8, frames: 24, fps: 20 },
  attackSW: { offset: 133, increment: 8, frames: 24, fps: 20 },
  attackW: { offset: 134, increment: 8, frames: 24, fps: 20 },
  attackNW: { offset: 135, increment: 8, frames: 24, fps: 20 },
  attack2N: { offset: 320, increment: 8, frames: 28, fps: 20 },
  attack2NE: { offset: 321, increment: 8, frames: 28, fps: 20 },
  attack2E: { offset: 322, increment: 8, frames: 28, fps: 20 },
  attack2SE: { offset: 323, increment: 8, frames: 28, fps: 20 },
  attack2S: { offset: 324, increment: 8, frames: 28, fps: 20 },
  attack2SW: { offset: 325, increment: 8, frames: 28, fps: 20 },
  attack2W: { offset: 326, increment: 8, frames: 28, fps: 20 },
  attack2NW: { offset: 327, increment: 8, frames: 28, fps: 20 },
  idle: { offset: 550, increment: 1, frames: 33, fps: 20 },
  //idle: { offset: 550, increment: 1, frames: 1, fps: 2 },
  deathArrow: { offset: 584, increment: 1, frames: 24, fps: 20 },
  deathHead: { offset: 608, increment: 1, frames: 24, fps: 20 },
  deathBody: { offset: 632, increment: 1, frames: 20, fps: 20 },
} as const satisfies AnimationSet;
