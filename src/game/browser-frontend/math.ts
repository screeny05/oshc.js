import { Vec2, VecIso } from '../types';

export class BrowserFrontendMath {
  public static cartesianToIso(vec2: Vec2): VecIso {
    return {
      i: vec2.x + vec2.y,
      j: vec2.y - vec2.x,
    };
  }

  public static isoToCartesian(vecIso: VecIso): Vec2 {
    return {
      x: (vecIso.i - vecIso.j) / 2,
      y: (vecIso.i + vecIso.j) / 2,
    };
  }

  public static snapMapPosition(iso: VecIso): VecIso {
    return { i: Math.floor(iso.i), j: Math.floor(iso.j) };
  }
}
