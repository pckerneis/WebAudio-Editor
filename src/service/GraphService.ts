import {BehaviorSubject, Observable} from 'rxjs';
import {Coordinates, getInitialGraphModel, GraphModel, NodeModel} from '../model/Graph.model';

export default class GraphService {
  public readonly state$: Observable<GraphModel>;

  private _store = new BehaviorSubject<GraphModel>(getInitialGraphModel());

  get snapshot(): GraphModel {
    return this._store.value;
  };

  constructor() {
    this.state$ = this._store.asObservable();
  }

  setViewportTranslate(coordinates: Coordinates): void {
    this._store.next(translateViewport(coordinates, this._store.value));
  }

  addNode(node: NodeModel): void {
    this._store.next(addNode(node.id, node, this._store.value));
  }

  setNodePosition(id: string, coordinates: Coordinates): void {
    this._store.next(setNodePosition(id, coordinates, this._store.value));
  }

  sendNodeToFront(id: string): void {
    this._store.next(sendNodeToFront(id, this._store.value));
  }

  setNodeName(id: string, name: string): void {
    this._store.next(setNodeName(id, name, this._store.value));
  }

  toggleNodeFoldState(id: string): void {
    this._store.next(toggleNodeFoldState(id, this._store.value));
  }
}

function translateViewport(coordinates: Coordinates, state: GraphModel): GraphModel {
  return {
    ...state,
    viewportOffset: coordinates,
  };
}

function addNode(id: string, nodeModel: NodeModel, state: GraphModel): GraphModel {
  if (Object.keys(state.nodes).includes(id)) {
    throw new Error('A node already exists with ID ' + id);
  }

  return {
    ...state,
    nodes: {...state.nodes, [id]: nodeModel},
    nodeOrder: [id, ...state.nodeOrder],
  };
}


function setNodePosition(id: string, coordinates: Coordinates, state: GraphModel): GraphModel {
  return transformExistingNode(id, state, (n) => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        ...coordinates,
      }
    }
  }))
}

function transformExistingNode(id: string,
                               state: GraphModel,
                               mapper: (n: NodeModel) => NodeModel): GraphModel {

  if (!Object.keys(state.nodes).includes(id)) {
    throw new Error('Cannot find node with ID ' + id);
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [id]: mapper(state.nodes[id]),
    },
  };
}

function sendNodeToFront(id: string, state: GraphModel): GraphModel {
  return {
    ...state,
    nodeOrder: [...state.nodeOrder.filter(n => n !== id), id],
  }
}

function setNodeName(id: string, name: string, state: GraphModel): GraphModel {
  return transformExistingNode(id, state, (node) => ({
    ...node,
    name,
  }));
}

function toggleNodeFoldState(id: string, state: GraphModel): GraphModel {
  return transformExistingNode(id, state, (node) => ({
    ...node,
    display: {
      ...node.display,
      folded: ! node.display.folded,
    },
  }));
}
