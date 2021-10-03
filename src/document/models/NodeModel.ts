import {PortModel} from './PortModel';
import Bounds from './Bounds';
import {NodeKind} from './NodeKind';

export interface NodeModel {
  id: string;
  kind: NodeKind;
  paramValues: ParamValues;
  display: NodeDisplay;
  name: string;
  inputPorts: PortModel[];
  outputPorts: PortModel[];
  paramPorts: ParamPorts;
}

export interface ParamValues {
  [paramName: string]: any;
}

export interface ParamPorts {
  [paramName: string]: PortModel;
}

export interface NodeDisplay {
  bounds: Bounds;
  folded: boolean;
}
