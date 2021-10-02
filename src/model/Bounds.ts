export default interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function areBoundsEqual(first: Bounds, second: Bounds): boolean {
  return first.x === second.x
    && first.y === second.y
    && first.width === second.width
    && first.height === second.height;
}
