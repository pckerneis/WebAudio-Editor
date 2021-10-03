import Identified from './Identified';
import {NodeKind} from '../model/NodeKind.model';
import Bounds from '../model/Bounds';
import {PortState} from './PortState';

export type NodeId = string;

export interface NodeState extends Identified<NodeId> {
  id: NodeId;
  kind: NodeKind;
  paramValues: ParamValues;
  display: NodeDisplay;
  name: string;
  inputPorts: PortState[];
  outputPorts: PortState[];
  paramPorts: ParamPorts;
}

export interface ParamValues {
  [paramName: string]: any;
}

export interface ParamPorts {
  [paramName: string]: PortState;
}

export interface NodeDisplay {
  bounds: Bounds;
  folded: boolean;
}
