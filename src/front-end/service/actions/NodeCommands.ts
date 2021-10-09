import Bounds from '../../../document/models/Bounds';
import {PortKind, PortModel} from '../../../document/models/PortModel';
import {GraphState} from '../../state/GraphState';
import Coordinates from '../../../document/models/Coordinates';
import {NodeDefinition, ParamType} from '../../../document/node-definitions/NodeDefinition';
import {NodeDisplay, ParamPorts, ParamValues} from '../../../document/models/NodeModel';
import {NodeState} from '../../state/NodeState';
import {constrainBetween} from '../../utils/numbers';
import {MAX_NODE_WIDTH, MIN_NODE_WIDTH} from '../GraphService';
import {nextId} from '../../utils/IdentifierGenerator';
import {NodeKind} from '../../../document/models/NodeKind';

function nextNodeId(knownIds: string[]): string {
  return nextId('Node-', knownIds);
}

export function isNodeId(candidate: any): candidate is string {
  return typeof candidate === 'string'
    && candidate.split('-').length === 2
    && candidate.split('-')[0] === 'Node';
}

export function assertNodeExists(nodeId: string, state: GraphState): void {
  if (!Object.keys(state.nodes).includes(nodeId)) {
    throw new Error('There is no node with ID ' + nodeId);
  }
}

export function createNode(definition: NodeDefinition,
                           bounds: Bounds, name: string,
                           graphState: GraphState): NodeState {
  const id = nextNodeId(extractAllNodeIds(graphState));

  const inputPorts = new Array(definition.inputPortCount).fill('').map((_, i) => ({
    id: `${id}-Input-${i}`,
    kind: PortKind.input,
  }));

  const outputPorts = new Array(definition.outputPortCount).fill('').map((_, i) => ({
    id: `${id}-Output-${i}`,
    kind: PortKind.output,
  }));

  const display: NodeDisplay = {
    bounds,
    folded: true,
  };

  const paramValues = {} as ParamValues;
  definition.params.forEach(p => paramValues[p.name] = p.defaultValue);

  const paramPorts = {} as ParamPorts;
  definition.params
    .filter(p => p.type === ParamType.AudioParam && p.acceptsInput)
    .forEach((p) => paramPorts[p.name] = {
      id: `${id}-${p.name}`,
      kind: PortKind.audioParam,
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

export function createAudioDestination(bounds: Bounds, graphState: GraphState): NodeState {
  const id = nextNodeId(extractAllNodeIds(graphState));
  return {
    id,
    name: 'destination',
    kind: NodeKind.destination,
    paramValues: {},
    display: {
      bounds,
      folded: false,
    },
    inputPorts: [{
      id: id + '-input',
      kind: PortKind.input,
    }],
    outputPorts: [],
    paramPorts: {},
  };
}

function extractAllNodeIds(graphState: GraphState): string[] {
  return Object.keys(graphState.nodes);
}

export function addNode(id: string, nodeState: NodeState, state: GraphState): GraphState {
  if (Object.keys(state.nodes).includes(id)) {
    throw new Error('A node already exists with ID ' + id);
  }

  return {
    ...state,
    nodes: {...state.nodes, [id]: nodeState},
    elementOrder: [...state.elementOrder, id],
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
    elementOrder: [...state.elementOrder.filter(n => n !== id), id],
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

export function findPortState(portId: string, state: GraphState): PortModel | null {
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

export function setParamValue(nodeId: string, paramName: string, value: any, state: GraphState): GraphState {
  return transformExistingNode(nodeId, state, n => ({
    ...n,
    paramValues: {
      ...n.paramValues,
      [paramName]: value,
    },
  }));
}

export function setNodeWidth(nodeId: string, newWidth: number, state: GraphState): GraphState {
  return transformExistingNode(nodeId, state, n => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        width: constrainBetween(newWidth, MIN_NODE_WIDTH, MAX_NODE_WIDTH),
      }
    }
  }));
}

export function setNodeHeight(nodeId: string, newHeight: number, state: GraphState): GraphState {
  return transformExistingNode(nodeId, state, n => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        height: newHeight,
      }
    }
  }));
}
