import React, {createRef} from 'react';
import './App.css';
import DragToMove from './ui-utils/DragToMove';
import GraphService from './service/GraphService';
import Node from './components/Node/Node';
import {NodeKind} from './model/NodeKind.model';
import SingletonWrapper from './service/SingletonWrapper';
import NodeDefinitionService from './service/NodeDefinitionService';
import {NodeDefinitionModel} from './model/NodeDefinition.model';
import {NodeState} from './state/NodeState';
import {Subscription} from 'rxjs';
import {GraphState} from './state/GraphState';
import {ConnectionState} from './state/ConnectionState';
import {PortComponentRegistry} from './service/PortComponentRegistry';
import SelectedItemSet from './utils/SelectedItemSet';
import Coordinates from './model/Coordinates';
import {cubicBezier, rectangleCenter, translate} from './utils/geometry';
import {ConnectionCurve, drawConnectionCurve, hitsConnectionCurve} from './ui-utils/ConnectionCurve';
import {PortKind, PortState} from './state/PortState';
import {getNodeDefinitions} from './model/StandardNodesDefinitions';

const nodeDefinitionService = SingletonWrapper
  .create(NodeDefinitionService, getNodeDefinitions())
  .get();

const serviceWrapper = SingletonWrapper.lazyWrap(GraphService);

const graphSelection = SingletonWrapper.create(SelectedItemSet).get() as SelectedItemSet<string>;

if (!SingletonWrapper.hasInstance(GraphService)) {
  const s = serviceWrapper.get();

  const osc = s.createAndAddNode('osc',
    nodeDefinitionService.getNodeDefinition(NodeKind.osc)!,
    {x: 120, y: 20, width: 100, height: 20});

  const gain1 = s.createAndAddNode('gain1',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 150, y: 300, width: 100, height: 20});

  const gain2 = s.createAndAddNode('gain2',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 200, y: 150, width: 100, height: 20});

  s.addConnection(osc.id, 0, gain1.id, 0);
  s.addConnection(gain1.id, 0, gain2.id, 0);
  s.addConnection(osc.id, 0, gain2.id, 0);

  graphSelection.addToSelection(osc.id);
}

const service = serviceWrapper.get();

interface AppState {
  graphState: GraphState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selection: string[];
  connectionCurves: ConnectionCurve[];
  mouseCoordinates: Coordinates | null;
}

class App extends React.Component<{}, AppState> {
  private _subscriptions: Subscription[] = [];
  private resizeHandler?: (() => void);

  constructor(props: {}) {
    super(props);

    this.state = {
      graphState: service.snapshot,
      canvasRef: createRef(),
      selection: graphSelection.items,
      connectionCurves: [],
      mouseCoordinates: null,
    };

    this._subscriptions.push(service.state$
      .subscribe((graphState) => this.setState((prev) => ({
        ...prev,
        graphState,
      }), () => {
        this.setState(s => ({
          ...s,
          connectionCurves: computeConnectionCurves(graphState, service),
        }));
      }))
    );

    this._subscriptions.push(graphSelection.selection$
      .subscribe((selection) => this.setState((prev) => ({
        ...prev,
        selection,
      }))));
  }

  componentWillUnmount(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
    this._subscriptions = [];

    if (this.resizeHandler != null) {
      window.removeEventListener('resize', this.resizeHandler!);
      this.resizeHandler = undefined;
    }
  }

  componentDidMount(): void {
    this.resizeHandler = () => this.renderConnections();
    window.addEventListener('resize', this.resizeHandler);

    this.setState(state => ({
      ...state,
      connectionCurves: computeConnectionCurves(state.graphState, service),
    }), () => this.renderConnections());
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    this.renderConnections();
  }

  private renderConnections(): void {
    const canvas = this.state.canvasRef.current;

    if (canvas != null) {
      canvas.width = canvas.clientWidth ?? 0;
      canvas.height = canvas.clientHeight ?? 0;
    }

    const ctx = canvas?.getContext('2d');

    if (ctx != null) {
      this.state.connectionCurves
        .map(connectionCurve => ({
          selected: graphSelection.isSelected(connectionCurve.id),
          connectionCurve
        }))
        .forEach(({selected, connectionCurve}) => drawConnectionCurve(connectionCurve.points, selected, ctx));

      if (this.state.graphState.temporaryConnectionPort != null && this.state.mouseCoordinates != null) {
        const points = computeTemporaryConnectionCurve(this.state.graphState.temporaryConnectionPort, this.state.mouseCoordinates, service);
        drawConnectionCurve(points, true, ctx);
      }
    }
  }

  render() {
    const {graphState} = this.state;
    const graphAnchorStyle = getGraphAnchorStyle(graphState);
    const nodes = buildNodes(graphState);

    const handlePointerDown = (evt: any) => {
      let somethingHit = false;
      const mouseCoordinates = {
        x: evt.clientX,
        y: evt.clientY,
      };

      if (this.state.graphState.temporaryConnectionPort) {
        const suitablePort = service.findSuitablePort(mouseCoordinates);

        if (suitablePort) {
          service.createOrApplyTemporaryConnection(suitablePort.id);
          somethingHit = true;
        } else {
          service.removeTemporaryConnection();
        }
      }

      if (!somethingHit) {
        for (const c of this.state.connectionCurves) {
          if (hitsConnectionCurve(mouseCoordinates, c, 8)) {
            graphSelection.selectOnMouseDown(c.id, evt);
            somethingHit = true;
          }
        }
      }

      if (!somethingHit) {
        graphSelection.clearSelection();
      }
    }

    const handleMouseMove = (e: any) => {
      this.setState(state => ({
        ...state,
        mouseCoordinates: {
          x: e.clientX,
          y: e.clientY,
        },
      }));
    };

    return (
      <div className="App"
           onMouseMove={handleMouseMove}>
        <div className="CanvasContainer">
          <canvas ref={this.state.canvasRef}/>
        </div>
        <div className="GraphContainer" onPointerDown={handlePointerDown}>
          <DragToMove
            onDragMove={e => service.setViewportTranslate(e)}
            elementPosition={service.snapshot.viewportOffset}
            buttons={[1]}
            style={({minHeight: '100vh'})}
          >
            <div className="GraphViewportAnchor" style={graphAnchorStyle}>
              {nodes}
            </div>
          </DragToMove>
        </div>
      </div>
    );
  }
}

function getGraphAnchorStyle(graphState: GraphState): any {
  const {x, y} = graphState.viewportOffset;
  return {transform: `translate(${x}px, ${y}px)`};
}

function buildNodes(graphState: GraphState): any {
  return graphState.nodeOrder
    .map((id: any) => ([id, graphState.nodes[id]] as [string, NodeState]))
    .map(([id, nodeState]: [string, NodeState]) => {
      const definition = nodeDefinitionService.getNodeDefinition(nodeState.kind) as NodeDefinitionModel;
      return (
        <Node key={id}
              nodeState={nodeState}
              service={service}
              definition={definition}
              portRegistry={service}
              selected={graphSelection.isSelected(id)}
              selectedItemSet={graphSelection}
        />
      )
    });
}

function computeConnectionCurves(graphState: GraphState, portRegistry: PortComponentRegistry): ConnectionCurve[] {
  return graphState.connections.map(connectionState => ({
    id: connectionState.id,
    points: computeConnectionCurve(connectionState, portRegistry),
  }));
}

function computeConnectionCurve(connection: ConnectionState, registry: PortComponentRegistry): Coordinates[] {
  const sourcePort = registry.getAllRegisteredPorts()
    .find(p => p.id === connection.source)?.ref.current;

  const targetPort = registry.getAllRegisteredPorts()
    .find(p => p.id === connection.target)?.ref.current;

  const sourcePortState = service.findPortState(connection.source);
  const targetPortState = service.findPortState(connection.target);

  if (!sourcePort || !targetPort || !sourcePortState || !targetPortState) {
    throw new Error('Cannot compute connection curve because either source port or target port could not be found.');
  }

  const sb = sourcePort.getBoundingClientRect();
  const tb = targetPort.getBoundingClientRect();

  const start = rectangleCenter(sb);
  const end = rectangleCenter(tb);
  const cp1 = translate(start, getControlPointOffset(sourcePortState.kind));
  const cp2 = translate(end, getControlPointOffset(targetPortState.kind));

  const points = [start, cp1, cp2, end];
  return cubicBezier(points, 100);
}

function getControlPointOffset(portKind: PortKind): Coordinates {
  switch (portKind) {
    case PortKind.OUTPUT:
      return {x: 0, y: 80};
    case PortKind.INPUT:
      return {x: 0, y: -80};
    case PortKind.AUDIO_PARAM:
      return {x: -80, y: 0};
  }
}

function computeTemporaryConnectionCurve(port: PortState, mouseCoordinates: Coordinates, service: GraphService): Coordinates[] {
  const sourcePort = service.getAllRegisteredPorts().find(p => p.id === port.id)?.ref.current;
  const portState = service.findPortState(port.id);

  if (!sourcePort || !portState) {
    throw new Error('Cannot compute temporary connection curve because source port could not be found.');
  }

  const sb = sourcePort.getBoundingClientRect();
  const start = rectangleCenter(sb);

  let points: Coordinates[];
  const suitablePort = service.findSuitablePort(mouseCoordinates);

  if (suitablePort != null) {
    const end = rectangleCenter(suitablePort.ref.current!.getBoundingClientRect());
    const cp1 = translate(start, getControlPointOffset(port.kind));
    const suitablePortKind = service.findPortState(suitablePort.id)?.kind;
    const cp2 = suitablePortKind == null ? end : translate(end, getControlPointOffset(suitablePortKind));
    points = [start, cp1, cp2, end];

  } else {
    const end = mouseCoordinates;
    const cp1 = translate(start, getControlPointOffset(port.kind));
    points = [start, cp1, end, end];
  }

  return cubicBezier(points, 100);
}

export default App;
