import Bounds, {emptyBounds} from '../../document/models/Bounds';

export interface MiniMapState {
  nodes: MiniMapNode[];
  viewportBounds: Bounds;
}

export interface MiniMapNode {
  id: string;
  bounds: Bounds;
}

export function getEmptyMiniMapState(): MiniMapState {
  return {
    nodes: [],
    viewportBounds: emptyBounds(),
  };
}
