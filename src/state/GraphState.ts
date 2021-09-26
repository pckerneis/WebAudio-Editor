import Coordinates from '../model/Coordinates';
import {NodeState} from './NodeState';
import {ConnectionState} from './ConnectionState';

type Id = string;

export interface GraphState {
  nodes: { [id: Id]: NodeState; };
  nodeOrder: string[];
  connections: ConnectionState[];
  viewportOffset: Coordinates;
}

export function getInitialGraphModel(): GraphState {
  return {
    connections: [],
    nodes: {},
    nodeOrder: [],
    viewportOffset: {x: 0, y: 0},
  };
}
