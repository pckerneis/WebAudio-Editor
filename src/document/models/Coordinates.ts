export default interface Coordinates {
  x: number;
  y: number;
}

export function emptyCoordinates(): Coordinates {
  return {
    x: 0,
    y: 0,
  }
}

export function isCoordinates(candidate: any): candidate is Coordinates {
  return typeof candidate === 'object'
    && typeof candidate.x === 'number'
    && typeof candidate.y === 'number';
}

export function areCoordinatesEqual(first: Coordinates, second: Coordinates): boolean {
  if (first == null || second == null) {
    return false;
  }

  return first.x === second.x && first.y === second.y;
}
