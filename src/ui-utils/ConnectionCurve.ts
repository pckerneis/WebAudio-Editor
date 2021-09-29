import Coordinates from '../model/Coordinates';
import {distToSegmentSquared} from '../utils/geometry';

export interface ConnectionCurve {
  id: string;
  points: Coordinates[];
}

export function drawConnectionCurve(points: Coordinates[], selected: boolean, ctx: CanvasRenderingContext2D): void {
  ctx.lineWidth = 2;
  ctx.strokeStyle = selected ? '#12acff' : 'grey';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.stroke();
}

export function hitsConnectionCurve(mouseCoordinates: Coordinates, connection: ConnectionCurve, maxDistance: number): boolean {
  for (let i = 1; i < connection.points.length; ++i) {

    const p1 = connection.points[i - 1];
    const p2 = connection.points[i];
    const distSquared = distToSegmentSquared(mouseCoordinates, p1, p2);
    if (distSquared < maxDistance * maxDistance) {
      return true;
    }
  }

  return false;
}

