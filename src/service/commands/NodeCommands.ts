import {NodeDefinitionModel, ParamType} from '../../model/NodeDefinition.model';
import Bounds from '../../model/Bounds';
import {NodeDisplay, NodeId, NodeState, ParamPorts, ParamValues} from '../../state/NodeState';
import {PortId, PortKind, PortState} from '../../state/PortState';
import {GraphState} from '../../state/GraphState';
import Coordinates from '../../model/Coordinates';
import SequenceGenerator from '../../utils/SequenceGenerator';

const sequence = new SequenceGenerator();

export function assertNodeExists(nodeId: string, state: GraphState): void {
  if (!Object.keys(state.nodes).includes(nodeId)) {
    throw new Error('There is no node with ID ' + nodeId);
  }
}

export function createNode(definition: NodeDefinitionModel, bounds: Bounds, name: string): NodeState {
  const id = sequence.nextString();

  const inputPorts = new Array(definition.inputPortCount).fill('').map(() => ({
    id: sequence.nextString(),
    kind: PortKind.INPUT,
  }));

  const outputPorts = new Array(definition.outputPortCount).fill('').map(() => ({
    id: sequence.nextString(),
    kind: PortKind.OUTPUT,
  }));

  const display: NodeDisplay = {
    bounds,
    folded: false,
  };

  const paramValues = {} as ParamValues;
  definition.params.forEach(p => paramValues[p.name] = p.defaultValue);

  const paramPorts = {} as ParamPorts;
  definition.params
    .filter(p => p.type === ParamType.AudioParam && p.acceptsInput)
    .forEach((p) => paramPorts[p.name] = {
      id: sequence.nextString(),
      kind: PortKind.AUDIO_PARAM,
    });

  return {
    id,
    kind: definition.kind,
    display,
    inputPorts,
    outputPorts,
    name,
    paramValues,
    paramPorts,
  };
}

export function addNode(id: string, nodeState: NodeState, state: GraphState): GraphState {
  if (Object.keys(state.nodes).includes(id)) {
    throw new Error('A node already exists with ID ' + id);
  }

  return {
    ...state,
    nodes: {...state.nodes, [id]: nodeState},
    nodeOrder: [id, ...state.nodeOrder],
  };
}

export function setNodePosition(id: string, coordinates: Coordinates, state: GraphState): GraphState {
  return transformExistingNode(id, state, (n) => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        ...coordinates,
      }
    }
  }));
}

export function transformExistingNode(id: string,
                               state: GraphState,
                               mapper: (n: NodeState) => NodeState): GraphState {
  assertNodeExists(id, state);

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [id]: mapper(state.nodes[id]),
    },
  };
}

export function sendNodeToFront(id: string, state: GraphState): GraphState {
  return {
    ...state,
    nodeOrder: [...state.nodeOrder.filter(n => n !== id), id],
  };
}

export function setNodeName(id: string, name: string, state: GraphState): GraphState {
  return transformExistingNode(id, state, (node) => ({
    ...node,
    name,
  }));
}

export function toggleNodeFoldState(id: string, state: GraphState): GraphState {
  return transformExistingNode(id, state, (node) => ({
    ...node,
    display: {
      ...node.display,
      folded: !node.display.folded,
    },
  }));
}

export function findPortState(portId: PortId, state: GraphState): PortState | null {
  for (let n of Object.values(state.nodes)) {
    for (let p of n.inputPorts) {
      if (p.id === portId) {
        return p;
      }
    }

    for (let p of n.outputPorts) {
      if (p.id === portId) {
        return p;
      }
    }

    for (let p of Object.values(n.paramPorts)) {
      if (p.id === portId) {
        return p;
      }
    }
  }

  return null;
}

export function setParamValue(nodeId: NodeId, paramName: string, value: any, state: GraphState): GraphState {
  return transformExistingNode(nodeId, state, n => ({
    ...n,
    paramValues: {
      ...n.paramValues,
      [paramName]: value,
    },
  }));
}