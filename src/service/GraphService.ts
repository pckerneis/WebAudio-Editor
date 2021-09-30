import {BehaviorSubject, Observable} from 'rxjs';
import {getInitialGraphModel, GraphState} from '../state/GraphState';
import Coordinates from '../model/Coordinates';
import {NodeId, NodeState} from '../state/NodeState';
import {PortComponentRegistry, ReferencedPort} from './PortComponentRegistry';
import {NodeDefinitionModel} from '../model/NodeDefinition.model';
import Bounds from '../model/Bounds';
import {PortId, PortState} from '../state/PortState';
import {squaredDist} from '../utils/numbers';
import {rectangleCenter} from '../utils/geometry';
import {
  addNode,
  createNode,
  findPortState,
  sendNodeToFront,
  setNodeName,
  setNodePosition,
  setParamValue,
  toggleNodeFoldState
} from './commands/NodeCommands';
import {
  addConnection,
  canConnect,
  createOrApplyTemporaryConnection,
  removeTemporaryConnection
} from './commands/ConnectionCommands';
import {translateViewport} from './commands/ViewportCommands';

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

  setParamValue(nodeId: NodeId, paramName: string, value: any): void {
    this._store.next(setParamValue(nodeId, paramName, value, this.snapshot));
  }
}
