import Identified from '../model/Identified';
import {NodeKind} from '../model/NodeKind.model';
import Bounds from '../model/Bounds';

export type NodeId = string;

export interface NodeState extends Identified<NodeId> {
  id: NodeId;
  kind: NodeKind;
  paramValues: ParamValues;
  display: NodeDisplay;
  name: string;
}

export interface ParamValues {
  [paramName: string]: any;
}

export interface NodeDisplay {
  bounds: Bounds;
  folded: boolean;
}