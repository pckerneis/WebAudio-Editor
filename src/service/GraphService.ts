import {BehaviorSubject, Observable} from 'rxjs';
import {getInitialGraphModel, GraphState} from '../state/GraphState';
import Coordinates from '../model/Coordinates';
import {NodeId, NodeState} from '../state/NodeState';
import {NodeDefinitionModel} from '../model/NodeDefinition.model';
import Bounds from '../model/Bounds';
import {PortId, PortState} from '../state/PortState';
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
  canConnect,
  createOrApplyTemporaryConnection,
  findParentNode,
  isConnectionId,
  removeTemporaryConnection
} from './actions/ConnectionCommands';
import {translateViewport} from './actions/ViewportCommands';

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

  createNode(name: string, definition: NodeDefinitionModel, bounds: Bounds): NodeState {
    return createNode(definition, bounds, name);
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

  setParamValue(nodeId: NodeId, paramName: string, value: any): void {
    this._store.next(setParamValue(nodeId, paramName, value, this.snapshot));
  }

  remove(items: string[]): void {
    this._store.next(remove(items, this.snapshot));
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

  const nodes: { [id: NodeId]: NodeState } = {};

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
