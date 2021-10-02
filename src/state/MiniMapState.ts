import Bounds, {emptyBounds} from '../model/Bounds';
import {NodeId} from './NodeState';

export interface MiniMapState {
  nodes: MiniMapNode[];
  viewportBounds: Bounds;
}

export interface MiniMapNode {
  id: NodeId;
  bounds: Bounds;
}

export function getEmptyMiniMapState(): MiniMapState {
  return {
    nodes: [],
    viewportBounds: emptyBounds(),
  };
}
