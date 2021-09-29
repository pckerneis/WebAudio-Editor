import {BehaviorSubject, Observable} from 'rxjs';
import {getInitialGraphModel, GraphState} from '../state/GraphState';
import Coordinates from '../model/Coordinates';
import {NodeDisplay, NodeState} from '../state/NodeState';
import {ConnectionState} from '../state/ConnectionState';
import {PortComponentRegistry, ReferencedPort} from './PortComponentRegistry';
import {NodeDefinitionModel, ParamType} from '../model/NodeDefinition.model';
import SequenceGenerator from '../utils/SequenceGenerator';
import Bounds from '../model/Bounds';
import {PortId, PortKind, PortState} from '../state/PortState';
import {squaredDist} from '../utils/numbers';
import {rectangleCenter} from '../utils/geometry';

const sequence = new SequenceGenerator();

export default class GraphService implements PortComponentRegistry {
  public readonly state$: Observable<GraphState>;

  private _registeredPorts: ReferencedPort[] = [];

  private _store = new BehaviorSubject<GraphState>(getInitialGraphModel());

  get snapshot(): GraphState {
    return this._store.value;
  };

  constructor() {
    this.state$ = this._store.asObservable();
  }

  setViewportTranslate(coordinates: Coordinates): void {
    this._store.next(translateViewport(coordinates, this.snapshot));
  }

  createNode(name: string, definition: NodeDefinitionModel, bounds: Bounds): NodeState {
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
    const paramValues = {} as any;
    definition.params.forEach(p => paramValues[p.name] = getDefaultValueForType(p.type));

    return {
      id,
      kind: definition.kind,
      display,
      inputPorts,
      outputPorts,
      name,
      paramValues,
    };
  }

  addNode(node: NodeState): void {
    this._store.next(addNode(node.id, node, this.snapshot));
  }

  createAndAddNode(name: string, definition: NodeDefinitionModel, bounds: Bounds): NodeState {
    const n = this.createNode(name, definition, bounds);
    this.addNode(n);
    return n;
  }

  setNodePosition(id: string, coordinates: Coordinates): void {
    this._store.next(setNodePosition(id, coordinates, this.snapshot));
  }

  sendNodeToFront(id: string): void {
    this._store.next(sendNodeToFront(id, this.snapshot));
  }

  setNodeName(id: string, name: string): void {
    this._store.next(setNodeName(id, name, this.snapshot));
  }

  toggleNodeFoldState(id: string): void {
    this._store.next(toggleNodeFoldState(id, this.snapshot));
  }

  addConnection(sourceNodeId: string, sourcePortIndex: number,
                targetNodeId: string, targetPortIndex: number): void {
    this._store.next(addConnection(sourceNodeId, sourcePortIndex, targetNodeId, targetPortIndex, this.snapshot));
  }

  getAllRegisteredPorts(): ReferencedPort[] {
    return [...this._registeredPorts];
  }

  registerPorts(...referencedPorts: ReferencedPort[]): void {
    const addedIds = referencedPorts.map(rp => rp.id);
    const untouched = this._registeredPorts.filter(rp => !addedIds.includes(rp.id));
    this._registeredPorts = [...untouched, ...referencedPorts];
  }

  createOrApplyTemporaryConnection(portId: PortId): any {
    this._store.next(createOrApplyTemporaryConnection(portId, this.snapshot));
  }

  removeTemporaryConnection(): void {
    this._store.next(removeTemporaryConnection(this.snapshot));
  }

  findPortState(id: PortId): PortState | null {
    return findPortState(id, this.snapshot);
  }

  canConnect(source: PortId, target: PortId): boolean {
    return canConnect(source, target, this.snapshot);
  }

  findSuitablePort(mouseCoordinates: Coordinates): ReferencedPort | null {
    if (this.snapshot.temporaryConnectionPort == null) {
      return null;
    }

    const sourcePort = this.snapshot.temporaryConnectionPort;
    const checkDistSquared = 225;

    return this.getAllRegisteredPorts().find(registeredPort => {
      const component = registeredPort.ref.current;

      if (component == null) {
        return false;
      }

      const portBounds = component.getBoundingClientRect();

      if (!this.canConnect(registeredPort.id, sourcePort.id)) {
        return false;
      }

      return squaredDist(rectangleCenter(portBounds), mouseCoordinates) < checkDistSquared;
    }) ?? null;
  }
}

function translateViewport(coordinates: Coordinates, state: GraphState): GraphState {
  return {
    ...state,
    viewportOffset: coordinates,
  };
}

function addNode(id: string, nodeState: NodeState, state: GraphState): GraphState {
  if (Object.keys(state.nodes).includes(id)) {
    throw new Error('A node already exists with ID ' + id);
  }

  return {
    ...state,
    nodes: {...state.nodes, [id]: nodeState},
    nodeOrder: [id, ...state.nodeOrder],
  };
}

function setNodePosition(id: string, coordinates: Coordinates, state: GraphState): GraphState {
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

function transformExistingNode(id: string,
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

function sendNodeToFront(id: string, state: GraphState): GraphState {
  return {
    ...state,
    nodeOrder: [...state.nodeOrder.filter(n => n !== id), id],
  };
}

function setNodeName(id: string, name: string, state: GraphState): GraphState {
  return transformExistingNode(id, state, (node) => ({
    ...node,
    name,
  }));
}

function toggleNodeFoldState(id: string, state: GraphState): GraphState {
  return transformExistingNode(id, state, (node) => ({
    ...node,
    display: {
      ...node.display,
      folded: !node.display.folded,
    },
  }));
}

function assertNodeExists(nodeId: string, state: GraphState): void {
  if (!Object.keys(state.nodes).includes(nodeId)) {
    throw new Error('There is no node with ID ' + nodeId);
  }
}

function addConnection(sourceNodeId: string, sourcePortIndex: number,
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

function doAddConnection(source: PortId, target: PortId, state: GraphState): GraphState {
  if (canConnect(source, target, state)) {
    const newConnection: ConnectionState = {
      id: sequence.nextString(),
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

function canConnect(source: PortId, target: PortId, state: GraphState): boolean {
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
  [PortKind.INPUT]: [PortKind.OUTPUT],
  [PortKind.OUTPUT]: [PortKind.AUDIO_PARAM, PortKind.INPUT],
  [PortKind.AUDIO_PARAM]: [PortKind.OUTPUT],
}

function areAlreadyConnected(source: PortId, target: PortId, state: GraphState): Boolean {
  return state.connections.find(c =>
    (c.target === target && c.source === source)
    || (c.target === source && c.source === target)) != null;
}

function findParentNode(portId: PortId, state: GraphState): NodeState | null {
  for (let n of Object.values(state.nodes)) {
    if (n.inputPorts.map(p => p.id).includes(portId)) {
      return n;
    } else if (n.outputPorts.map(p => p.id).includes(portId)) {
      return n;
    }
  }

  return null;
}

function getDefaultValueForType(type: ParamType): any {
  // TODO
  return '';
}

function createOrApplyTemporaryConnection(portId: PortId, state: GraphState): GraphState {
  const port = findPortState(portId, state);

  if (port == null) {
    throw new Error('Could not find port with ID ' + portId);
  }

  if (state.temporaryConnectionPort == null) {
    return {
      ...state,
      temporaryConnectionPort: port,
    };
  } else if (state.temporaryConnectionPort.id === port.id) {
    return {
      ...state,
      temporaryConnectionPort: null,
    }
  } else {
    return {
      ...doAddConnection(state.temporaryConnectionPort.id, port.id, state),
      temporaryConnectionPort: null,
    };
  }
}

function removeTemporaryConnection(state: GraphState): GraphState {
  return {
    ...state,
    temporaryConnectionPort: null,
  };
}

function findPortState(portId: PortId, state: GraphState): PortState | null {
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
  }

  return null;
}
