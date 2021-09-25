type Id = string;

export interface GraphModel {
  nodes: { [id: Id]: NodeModel; };
  nodeOrder: string[];
  connections: ConnectionModel[];
  viewportOffset: Coordinates;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface Identified {
  id: Id;
}

export enum NodeKind {
  osc = 'osc',
  gain = 'gain',
  delay = 'delay',
}

export interface NodeModel extends Identified {
  id: Id;
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
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ConnectionModel extends Identified {
  id: Id;
  source: Id;
  destination: Id;
}

export function getInitialGraphModel(): GraphModel {
  return {
    connections: [],
    nodes: {},
    nodeOrder: [],
    viewportOffset: { x: 0, y: 0 },
  };
}
