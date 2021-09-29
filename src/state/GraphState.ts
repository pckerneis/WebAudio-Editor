import Coordinates from '../model/Coordinates';
import {NodeState} from './NodeState';
import {ConnectionState} from './ConnectionState';
import {PortState} from './PortState';

type Id = string;

export interface GraphState {
  nodes: { [id: Id]: NodeState; };
  nodeOrder: string[];
  connections: ConnectionState[];
  viewportOffset: Coordinates;
  temporaryConnectionPort: PortState | null;
}

export function getInitialGraphModel(): GraphState {
  return {
    connections: [],
    nodes: {},
    nodeOrder: [],
    viewportOffset: {x: 0, y: 0},
    temporaryConnectionPort: null,
  };
}
