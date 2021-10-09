import {getInitialGraphModel, GraphState} from '../state/GraphState';
import Coordinates from '../../document/models/Coordinates';
import {NodeState} from '../state/NodeState';
import Bounds from '../../document/models/Bounds';
import {PortModel} from '../../document/models/PortModel';
import {
  addNode,
  createAudioDestination,
  createNode,
  findPortState,
  isNodeId,
  sendNodeToFront,
  setNodeHeight,
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
import {NodeDefinition} from '../../document/node-definitions/NodeDefinition';
import StoreBasedService from './helpers/StoreBasedService';
import {ContainerState} from '../state/ContainerState';
import {
  addContainer,
  createContainer,
  isContainerId,
  setContainerHeight,
  setContainerName,
  setContainerPosition,
  setContainerSize,
  setContainerWidth
} from './actions/ContainerCommands';

export const DEFAULT_NODE_WIDTH = 150;
export const MIN_NODE_WIDTH = 80;
export const MAX_NODE_WIDTH = 400;

export default class GraphService extends StoreBasedService<GraphState> {
  constructor() {
    super(getInitialGraphModel());
  }

  createAndAddNode(name: string, definition: NodeDefinition, bounds: Bounds): NodeState {
    const n = createNode(definition, bounds, name, this.snapshot);
    this.addNode(n);
    return n;
  }

  createAndAddContainer(name: string, bounds: Bounds): ContainerState {
    const n = createContainer(name, bounds, this.snapshot);
    this.addContainer(n);
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

  private addContainer(container: ContainerState): void {
    this.commit(s => addContainer(container, s));
  }

  setNodePosition(id: string, coordinates: Coordinates): void {
    this.commit(s => setNodePosition(id, coordinates, s));
  }

  setNodeWidth(nodeId: string, newWidth: number): void {
    this.commit(s => setNodeWidth(nodeId, newWidth, s));
  }

  setNodeHeight(nodeId: string, newHeight: number): void {
    this.commit(s => setNodeHeight(nodeId, newHeight, s));
  }

  setContainerPosition(id: string, coordinates: Coordinates): void {
    this.commit(s => setContainerPosition(id, coordinates, s));
  }

  setContainerWidth(id: string, width: number): void {
    this.commit(s => setContainerWidth(id, width, s));
  }

  setContainerHeight(id: string, height: number): void {
    this.commit(s => setContainerHeight(id, height, s));
  }

  setContainerSize(id: string, width: number, height: number): void {
    this.commit(s => setContainerSize(id, width, height, s));
  }

  setContainerName(id: string, name: string): void {
    this.commit(s => setContainerName(id, name, s));
  }

  sendContainerToFront(id: string): void {
    this.commit(s => sendNodeToFront(id, s));
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
    const newState: GraphState = {
      containers: {},
      nodes: {},
      connections: [],
      elementOrder: [],
      temporaryConnectionPort: null,
      ...(graphState as Partial<GraphState>),
    };
    this.commit(newState);
  }
}

function remove(ids: string[], state: GraphState): GraphState {
  const connectionsToRemove = ids.filter(isConnectionId);
  const nodesToRemove = ids.filter(isNodeId);
  const connectionToRemove = ids.filter(isContainerId);
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

  const nodeOrder = state.elementOrder.filter(id => !nodesToRemove.includes(id));
  const connections = state.connections.filter(({id}) => !impactedConnections.includes(id)
    && !connectionsToRemove.includes(id));

  const containers: { [id: string]: ContainerState } = {};

  Object.entries(state.containers).forEach(([id, container]) => {
    if (!connectionToRemove.includes(id)) {
      containers[id] = container;
    }
  });

  return {
    ...state,
    nodes,
    containers,
    elementOrder: nodeOrder,
    connections,
  };
}
