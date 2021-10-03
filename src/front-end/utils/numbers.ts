import Coordinates from '../../document/models/Coordinates';

export function constrainBetween(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(v, max));
}

export function squared(x: number) {
  return x * x
}

export function squaredDist(v: Coordinates, w: Coordinates) {
  return squared(v.x - w.x) + squared(v.y - w.y)
}
