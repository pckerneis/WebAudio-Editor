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

export function emptyBounds(): Bounds {
  return {
    x: 0, y: 0, width: 0, height: 0,
  };
}

interface OuterBounds {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

function infiniteOuterBounds(): OuterBounds {
  return {
    top: Infinity,
    left: Infinity,
    bottom: -Infinity,
    right: -Infinity,
  };
}

export function getOuterBounds(...bounds: Bounds[]): Bounds {
  return outerBoundsToBounds(bounds.reduce((acc, curr) => {
    return {
      left: Math.min(acc.left, curr.x),
      top: Math.min(acc.top, curr.y),
      right: Math.max(acc.right, curr.x + curr.width),
      bottom: Math.max(acc.bottom, curr.y + curr.height),
    }
  }, infiniteOuterBounds()));
}

export function outerBoundsToBounds(outerBounds: OuterBounds): Bounds {
  return {
    x: outerBounds.left,
    y: outerBounds.top,
    width: outerBounds.right - outerBounds.left,
    height: outerBounds.bottom - outerBounds.top,
  };
}

export function expandBounds(bounds: Bounds, amount: number): Bounds {
  return {
    x: bounds.x - (amount / 2),
    y: bounds.y - (amount / 2),
    width: bounds.width + amount,
    height: bounds.height + amount,
  };
}
