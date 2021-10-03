import Coordinates from './Coordinates';
import {NodeModel} from './NodeModel';
import {ConnectionModel} from './ConnectionModel';

export type NodeModels = { [id: string]: NodeModel; };

export interface AudioGraphModel {
  nodes: NodeModels;
  nodeOrder: string[];
  connections: ConnectionModel[];
  viewportOffset: Coordinates;
}
