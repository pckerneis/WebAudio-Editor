import Coordinates from '../../document/models/Coordinates';
import {cubicBezier, distToSegmentSquared, rectangleCenter, translate} from '../utils/geometry';
import {PortComponentRegistry} from '../service/PortComponentRegistry';
import {ConnectionState} from '../state/ConnectionState';
import {PortKind} from '../../document/models/PortModel';
import GraphService from '../service/GraphService';
import {getDefaultConnectionColor, getSelectionOutlineColor} from './themes';

export interface ConnectionCurve {
  id: string;
  points: Coordinates[];
}

export function drawConnectionCurve(points: Coordinates[], selected: boolean, ctx: CanvasRenderingContext2D): void {
  ctx.lineWidth = 2;
  ctx.strokeStyle = selected ? getSelectionOutlineColor() : getDefaultConnectionColor();
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

export function computeConnectionCurves(graphService: GraphService,
                                        portRegistry: PortComponentRegistry): ConnectionCurve[] {
  return graphService.snapshot.connections.map(connectionState => ({
    id: connectionState.id,
    points: computeConnectionCurve(connectionState, graphService, portRegistry),
  }));
}

export function computeConnectionCurve(connection: ConnectionState,
                                       graphService: GraphService,
                                       registry: PortComponentRegistry): Coordinates[] {
  const sourcePort = registry.getAllRegisteredPorts()
    .find(p => p.id === connection.source)?.ref.current;

  const targetPort = registry.getAllRegisteredPorts()
    .find(p => p.id === connection.target)?.ref.current;

  const sourcePortState = graphService.findPortState(connection.source);
  const targetPortState = graphService.findPortState(connection.target);

  if (!sourcePort || !targetPort || !sourcePortState || !targetPortState) {
    throw new Error('Cannot compute connection curve because either source port or target port could not be found.');
  }

  const sb = sourcePort.getBoundingClientRect();
  const tb = targetPort.getBoundingClientRect();

  const start = rectangleCenter(sb);
  const end = rectangleCenter(tb);
  const cp1 = translate(start, getControlPointOffset(sourcePortState.kind));
  const cp2 = translate(end, getControlPointOffset(targetPortState.kind));

  const points = [start, cp1, cp2, end];
  return cubicBezier(points, 100);
}

export function getControlPointOffset(portKind: PortKind): Coordinates {
  switch (portKind) {
    case PortKind.output:
      return {x: 0, y: 80};
    case PortKind.input:
      return {x: 0, y: -80};
    case PortKind.audioParam:
      return {x: -80, y: 0};
  }
}

export function computeTemporaryConnectionCurve(mouseCoordinates: Coordinates,
                                                service: GraphService,
                                                portRegistry: PortComponentRegistry): Coordinates[] {
  const port = service.snapshot.temporaryConnectionPort;

  if (!port) {
    throw new Error(`Cannot compute temporary connection curve there's no source port.`);
  }

  const sourcePort = portRegistry.getAllRegisteredPorts().find(p => p.id === port.id)?.ref.current;
  const portState = service.findPortState(port.id);

  if (!sourcePort || !portState) {
    throw new Error('Cannot compute temporary connection curve because source port could not be found.');
  }

  const sb = sourcePort.getBoundingClientRect();
  const start = rectangleCenter(sb);

  let points: Coordinates[];
  const suitablePort = portRegistry.findSuitablePort(mouseCoordinates, service.snapshot);

  if (suitablePort != null) {
    const end = rectangleCenter(suitablePort.ref.current!.getBoundingClientRect());
    const cp1 = translate(start, getControlPointOffset(port.kind));
    const suitablePortKind = service.findPortState(suitablePort.id)?.kind;
    const cp2 = suitablePortKind == null ? end : translate(end, getControlPointOffset(suitablePortKind));
    points = [start, cp1, cp2, end];

  } else {
    const end = mouseCoordinates;
    const cp1 = translate(start, getControlPointOffset(port.kind));
    points = [start, cp1, end, end];
  }

  return cubicBezier(points, 100);
}
