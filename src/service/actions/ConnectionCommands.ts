import {GraphState} from '../../state/GraphState';
import {PortId, PortKind} from '../../state/PortState';
import {ConnectionId, ConnectionState} from '../../state/ConnectionState';
import {NodeState} from '../../state/NodeState';
import {assertNodeExists, findPortState} from './NodeCommands';
import SequenceGenerator from '../../utils/SequenceGenerator';

const sequence = new SequenceGenerator();

function nextConnectionId(): ConnectionId {
  return `Connection-${sequence.nextString()}`;
}

export function isConnectionId(candidate: any): candidate is ConnectionId {
  return typeof candidate === 'string'
    && candidate.split('-').length === 2
    && candidate.split('-')[0] === 'Connection';
}

export function addConnection(sourceNodeId: string, sourcePortIndex: number,
                       targetNodeId: string, targetPortIndex: number,
                       state: GraphState): GraphState {
  assertNodeExists(sourceNodeId, state);
  assertNodeExists(targetNodeId, state);

  const source = state.nodes[sourceNodeId].outputPorts[sourcePortIndex];
  const target = state.nodes[targetNodeId].inputPorts[targetPortIndex];

  if (!source || !target) {
    throw new Error('Cannot find port.');
  }

  return doAddConnection(source.id, target.id, state);
}

export function doAddConnection(source: PortId, target: PortId, state: GraphState): GraphState {
  if (canConnect(source, target, state)) {
    const newConnection: ConnectionState = {
      id: nextConnectionId(),
      source,
      target
    };

    return {
      ...state,
      connections: [...state.connections, newConnection],
    };
  }

  return state;
}

export function canConnect(source: PortId, target: PortId, state: GraphState): boolean {
  if (source === target) {
    return false;
  }

  const sourceNode = findParentNode(source, state);
  const targetNode = findParentNode(target, state);

  if (sourceNode === null
    || targetNode === null
    || sourceNode === targetNode) {
    return false;
  }

  if (areAlreadyConnected(source, target, state)) {
    return false;
  }

  const sourcePort = findPortState(source, state);
  const targetPort = findPortState(target, state);

  if (sourcePort === null || targetPort === null) {
    return false;
  }

  return portKindAllowedMapping[sourcePort.kind].includes(targetPort.kind)
    && portKindAllowedMapping[targetPort.kind].includes(sourcePort.kind)
}

const portKindAllowedMapping: { [kind in PortKind]: PortKind[] } = {
  [PortKind.input]: [PortKind.output],
  [PortKind.output]: [PortKind.audioParam, PortKind.input],
  [PortKind.audioParam]: [PortKind.output],
}

export function areAlreadyConnected(source: PortId, target: PortId, state: GraphState): Boolean {
  return state.connections.find(c =>
    (c.target === target && c.source === source)
    || (c.target === source && c.source === target)) != null;
}

export function findParentNode(portId: PortId, state: GraphState): NodeState | null {
  for (let n of Object.values(state.nodes)) {
    if (n.inputPorts.map(p => p.id).includes(portId)) {
      return n;
    } else if (n.outputPorts.map(p => p.id).includes(portId)) {
      return n;
    } else if (Object.values(n.paramPorts).map(p => p.id).includes(portId)) {
      return n;
    }
  }

  return null;
}

export function createTemporaryConnection(portId: PortId, state: GraphState): GraphState {
  const port = findPortState(portId, state);

  if (port == null) {
    throw new Error('Could not find port with ID ' + portId);
  }

  return {
    ...state,
    temporaryConnectionPort: port,
  };
}

export function applyTemporaryConnection(portId: PortId, state: GraphState): GraphState {
  const port = findPortState(portId, state);

  if (port == null) {
    throw new Error('Could not find port with ID ' + portId);
  }

  if (state.temporaryConnectionPort == null) {
    throw new Error('Cannot apply temporary connection without a temporary source port set.');
  }

  return {
    ...doAddConnection(state.temporaryConnectionPort.id, port.id, state),
    temporaryConnectionPort: null,
  };
}

export function removeTemporaryConnection(state: GraphState): GraphState {
  return {
    ...state,
    temporaryConnectionPort: null,
  };
}
