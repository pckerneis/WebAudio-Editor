import {NodeState} from './NodeState';
import {ConnectionState} from './ConnectionState';
import {PortModel} from '../../document/models/PortModel';
import {AudioGraphModel} from '../../document/models/AudioGraphModel';
import {ContainerState} from './ContainerState';

type Id = string;

export interface GraphState extends AudioGraphModel {
  containers: { [id: Id]: ContainerState; };
  nodes: { [id: Id]: NodeState; };
  nodeOrder: string[];
  connections: ConnectionState[];
  temporaryConnectionPort: PortModel | null;
}

export function getInitialGraphModel(): GraphState {
  return {
    connections: [],
    containers: {},
    nodes: {},
    nodeOrder: [],
    temporaryConnectionPort: null,
  };
}
