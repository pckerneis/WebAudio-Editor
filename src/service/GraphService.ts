import {BehaviorSubject, Observable} from 'rxjs';
import {getInitialGraphModel, GraphState} from '../state/GraphState';
import Coordinates from '../model/Coordinates';
import {NodeDisplay, NodeState} from '../state/NodeState';
import {ConnectionState} from '../state/ConnectionState';
import {PortRegistry, ReferencedPort} from './PortRegistry';
import {NodeDefinitionModel, ParamType} from '../model/NodeDefinition.model';
import SequenceGenerator from '../utils/SequenceGenerator';
import Bounds from '../model/Bounds';

export default class GraphService implements PortRegistry {
  public readonly state$: Observable<GraphState>;

  private _registeredPorts: ReferencedPort[] = [];

  private _store = new BehaviorSubject<GraphState>(getInitialGraphModel());
  private _sequence = new SequenceGenerator();

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
    const id = this._sequence.nextString();
    const inputPorts = new Array(definition.inputPortCount).fill('').map(() => this._sequence.nextString());
    const outputPorts = new Array(definition.outputPortCount).fill('').map(() => this._sequence.nextString());
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
    const connectionId = this._sequence.nextString();
    this._store.next(addConnection(connectionId, sourceNodeId, sourcePortIndex, targetNodeId, targetPortIndex,
      this.snapshot));
  }

  getAllRegisteredPorts(): ReferencedPort[] {
    return [...this._registeredPorts];
  }

  registerPorts(...referencedPorts: ReferencedPort[]): void {
    const addedIds = referencedPorts.map(rp => rp.id);
    const untouched = this._registeredPorts.filter(rp => !addedIds.includes(rp.id));
    this._registeredPorts = [...untouched, ...referencedPorts];
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

function addConnection(connectionId: string,
                       sourceNodeId: string, sourcePortIndex: number,
                       targetNodeId: string, targetPortIndex: number,
                       state: GraphState): GraphState {
  assertNodeExists(sourceNodeId, state);
  assertNodeExists(targetNodeId, state);

  const source = state.nodes[sourceNodeId].outputPorts[sourcePortIndex];
  const target = state.nodes[targetNodeId].inputPorts[targetPortIndex];

  if (!source || !target) {
    throw new Error('Cannot find port.');
  }

  const newConnection: ConnectionState = {id: connectionId, source, target};

  return {
    ...state,
    connections: [...state.connections, newConnection],
  };
}

function getDefaultValueForType(type: ParamType): any {
  // TODO
  return '';
}
