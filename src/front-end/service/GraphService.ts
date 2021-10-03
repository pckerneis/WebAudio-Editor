import {BehaviorSubject, Observable} from 'rxjs';
import {getInitialGraphModel, GraphState} from '../state/GraphState';
import Coordinates from '../../document/models/Coordinates';
import {NodeState} from '../state/NodeState';
import Bounds from '../../document/models/Bounds';
import {PortModel} from '../../document/models/PortModel';
import {
  addNode,
  createNode,
  findPortState,
  isNodeId,
  sendNodeToFront,
  setNodeName,
  setNodePosition,
  setParamValue,
  toggleNodeFoldState
} from './actions/NodeCommands';
import {
  addConnection,
  applyTemporaryConnection,
  canConnect,
  createTemporaryConnection,
  findParentNode,
  isConnectionId,
  removeTemporaryConnection
} from './actions/ConnectionCommands';
import {translateViewport} from './actions/ViewportCommands';
import {NodeDefinition} from '../../document/node-definitions/NodeDefinition';

export default class GraphService {
  public readonly state$: Observable<GraphState>;

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

  createNode(name: string, definition: NodeDefinition, bounds: Bounds): NodeState {
    return createNode(definition, bounds, name);
  }

  addNode(node: NodeState): void {
    this._store.next(addNode(node.id, node, this.snapshot));
  }

  createAndAddNode(name: string, definition: NodeDefinition, bounds: Bounds): NodeState {
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

  createTemporaryConnection(portId: string): any {
    this._store.next(createTemporaryConnection(portId, this.snapshot));
  }

  applyTemporaryConnection(portId: string): any {
    this._store.next(applyTemporaryConnection(portId, this.snapshot));
  }

  removeTemporaryConnection(): void {
    this._store.next(removeTemporaryConnection(this.snapshot));
  }

  findPortState(id: string): PortModel | null {
    return findPortState(id, this.snapshot);
  }

  canConnect(source: string, target: string): boolean {
    return canConnect(source, target, this.snapshot);
  }

  setParamValue(nodeId: string, paramName: string, value: any): void {
    this._store.next(setParamValue(nodeId, paramName, value, this.snapshot));
  }

  remove(items: string[]): void {
    this._store.next(remove(items, this.snapshot));
  }

  hasTemporaryConnection(): boolean {
    return this.snapshot.temporaryConnectionPort != null;
  }

  loadState(graphState: GraphState): void {
    this._store.next(graphState);
  }
}

function remove(ids: string[], state: GraphState): GraphState {
  const connectionsToRemove = ids.filter(isConnectionId);
  const nodesToRemove = ids.filter(isNodeId);
  const impactedConnections = state.connections
    .filter(c => {
      const sourceNode = findParentNode(c.source, state)?.id;
      const targetNode = findParentNode(c.target, state)?.id;
      return (sourceNode && nodesToRemove.includes(sourceNode))
        || (targetNode && nodesToRemove.includes(targetNode));
    })
    .map(c => c.id);

  const nodes: { [id: string]: NodeState } = {};

  Object.entries(state.nodes).forEach(([id, node]) => {
    if (!nodesToRemove.includes(id)) {
      nodes[id] = node;
    }
  });

  const nodeOrder = state.nodeOrder.filter(id => !nodesToRemove.includes(id));
  const connections = state.connections.filter(({id}) => !impactedConnections.includes(id)
    && !connectionsToRemove.includes(id));

  return {
    ...state,
    nodes,
    nodeOrder,
    connections,
  };
}
