import Coordinates from '../../document/models/Coordinates';
import {NodeState} from './NodeState';
import {ConnectionState} from './ConnectionState';
import {PortModel} from '../../document/models/PortModel';
import {AudioGraphModel} from '../../document/models/AudioGraphModel';

type Id = string;

export interface GraphState extends AudioGraphModel {
  nodes: { [id: Id]: NodeState; };
  nodeOrder: string[];
  connections: ConnectionState[];
  viewportOffset: Coordinates;
  temporaryConnectionPort: PortModel | null;
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
