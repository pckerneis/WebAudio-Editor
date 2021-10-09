import {NodeModel} from './NodeModel';
import {ConnectionModel} from './ConnectionModel';

export type NodeModels = { [id: string]: NodeModel; };

export interface AudioGraphModel {
  nodes: NodeModels;
  elementOrder: string[];
  connections: ConnectionModel[];
}
