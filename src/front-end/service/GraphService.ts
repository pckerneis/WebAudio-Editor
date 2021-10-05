import {getInitialGraphModel, GraphState} from '../state/GraphState';
import Coordinates from '../../document/models/Coordinates';
import {NodeState} from '../state/NodeState';
import Bounds from '../../document/models/Bounds';
import {PortModel} from '../../document/models/PortModel';
import {
  addNode, createAudioDestination,
  createNode,
  findPortState,
  isNodeId,
  sendNodeToFront,
  setNodeName,
  setNodePosition,
  setNodeWidth,
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
import StoreBasedService from './helpers/StoreBasedService';

export const DEFAULT_NODE_WIDTH = 150;
export const MIN_NODE_WIDTH = 80;
export const MAX_NODE_WIDTH = 400;

export default class GraphService extends StoreBasedService<GraphState> {
  constructor() {
    super(getInitialGraphModel());
  }

  setViewportTranslate(coordinates: Coordinates): void {
    this.commit(s => translateViewport(coordinates, s));
  }

  createAndAddNode(name: string, definition: NodeDefinition, bounds: Bounds): NodeState {
    const n = createNode(definition, bounds, name, this.snapshot);
    this.addNode(n);
    return n;
  }

  addAudioDestination(bounds: Bounds): NodeState {
    const n = createAudioDestination(bounds, this.snapshot);
    this.addNode(n);
    return n;
  }

  private addNode(node: NodeState): void {
    this.commit(s => addNode(node.id, node, s));
  }

  setNodePosition(id: string, coordinates: Coordinates): void {
    this.commit(s => setNodePosition(id, coordinates, s));
  }

  sendNodeToFront(id: string): void {
    this.commit(s => sendNodeToFront(id, s));
  }

  setNodeName(id: string, name: string): void {
    this.commit(s => setNodeName(id, name, s));
  }

  toggleNodeFoldState(id: string): void {
    this.commit(s => toggleNodeFoldState(id, s));
  }

  addConnection(sourceNodeId: string, sourcePortIndex: number,
                targetNodeId: string, targetPortIndex: number): void {
    this.commit(s => addConnection(sourceNodeId, sourcePortIndex, targetNodeId, targetPortIndex, s));
  }

  createTemporaryConnection(portId: string): any {
    this.commit(s => createTemporaryConnection(portId, s));
  }

  applyTemporaryConnection(portId: string): any {
    this.commit(s => applyTemporaryConnection(portId, s));
  }

  removeTemporaryConnection(): void {
    this.commit(s => removeTemporaryConnection(s));
  }

  findPortState(id: string): PortModel | null {
    return findPortState(id, this.snapshot);
  }

  canConnect(source: string, target: string): boolean {
    return canConnect(source, target, this.snapshot);
  }

  setParamValue(nodeId: string, paramName: string, value: any): void {
    this.commit(s => setParamValue(nodeId, paramName, value, s));
  }

  remove(items: string[]): void {
    this.commit(s => remove(items, s));
  }

  hasTemporaryConnection(): boolean {
    return this.snapshot.temporaryConnectionPort != null;
  }

  loadState(graphState: GraphState): void {
    this.commit(() => graphState);
  }

  setNodeWidth(nodeId: string, newWidth: number): void {
    this.commit(s => setNodeWidth(nodeId, newWidth, s));
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
