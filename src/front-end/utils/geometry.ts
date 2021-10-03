import Bounds from '../../document/models/Bounds';
import Coordinates from '../../document/models/Coordinates';
import {constrainBetween, squaredDist} from './numbers';

export function rectangleCenter(rectangle: Bounds): Coordinates {
  return {
    x: rectangle.x + rectangle.width / 2,
    y: rectangle.y + rectangle.height / 2,
  }
}

export function translateY(c: Coordinates, yOffset: number): Coordinates {
  return {
    ...c,
    y: c.y + yOffset,
  };
}

export function translate(c: Coordinates, offset: Coordinates): Coordinates {
  return {
    ...c,
    x: c.x + offset.x,
    y: c.y + offset.y,
  };
}

export function cubicBezier(points: Coordinates[], numSegments: number): Coordinates[] {
  if (points.length !== 4) {
    throw new Error('Expected 4 control points to compute cubic bezier');
  }

  const interval = 1 / (numSegments + 1);
  const curve = [];

  for (let t = 0; t <= 1; t += interval) {
    curve.push(computeBezierPoint(points, t));
  }

  return curve;
}

function computeBezierPoint(points: Coordinates[], t: number): Coordinates {
  if (points.length === 1) {
    return points[0];
  } else {
    const newPoints = [];

    for (let i = 0; i < points.length - 1; i++) {
      const x = (1 - t) * points[i].x + t * points[i + 1].x
      const y = (1 - t) * points[i].y + t * points[i + 1].y
      newPoints.push({x, y});
    }

    return computeBezierPoint(newPoints, t);
  }
}

export function distToSegmentSquared(p: Coordinates, v: Coordinates, w: Coordinates) {
  const l2 = squaredDist(v, w);

  if (l2 === 0) return squaredDist(p, v);

  const t = constrainBetween(((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2,
    0, 1)

  return squaredDist(p, {
    x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y)
  });
}
