import { animationSetArabGrenadier, AnimationDescriptor } from './animation-set';

export interface BodyFrames {
  idle: AnimationDescriptor;
  moveN: AnimationDescriptor;
  moveNE: AnimationDescriptor;
  moveE: AnimationDescriptor;
  moveSE: AnimationDescriptor;
  moveS: AnimationDescriptor;
  moveSW: AnimationDescriptor;
  moveW: AnimationDescriptor;
  moveNW: AnimationDescriptor;
  deathArrow?: AnimationDescriptor;
  deathHead?: AnimationDescriptor;
  deathBody?: AnimationDescriptor;
}

export interface Body {
  type: string;
  spritesheet: string;
  frames: BodyFrames;
  /** In tiles/second */
  movementSpeed: number;
  health: number;
}

export const bodyCollection: Record<number, Body> = {
  0: {
    type: 'arab_grenadier',
    spritesheet: 'body_arab_grenadier',
    frames: animationSetArabGrenadier,
    movementSpeed: 2.5,
    health: 2,
  },
};
