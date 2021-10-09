import React, {createRef} from 'react';
import './GraphComponent.css';
import DragToMove from '../../ui-utils/DragToMove';
import Node, {areNodesVisuallySimilar} from '../Node/Node';
import {NodeState} from '../../state/NodeState';
import {Observable, Subscription, switchMap} from 'rxjs';
import {GraphState} from '../../state/GraphState';
import Coordinates, {areCoordinatesEqual, emptyCoordinates} from '../../../document/models/Coordinates';
import {
  computeConnectionCurves,
  computeTemporaryConnectionCurve,
  ConnectionCurve,
  drawConnectionCurve,
  hitsConnectionCurve
} from '../../ui-utils/ConnectionCurve';
import {consumeEvent} from '../../ui-utils/events';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import {arePrimitiveArraysEqual} from '../../utils/arrays';
import MiniMap, {computeMiniMapState} from '../MiniMap/MiniMap';
import {getEmptyMiniMapState, MiniMapState} from '../../state/MiniMapState';
import {areBoundsEqual} from '../../../document/models/Bounds';
import {TransactionNames} from '../../service/HistoryService';
import {Layout} from '../../service/LayoutService';
import ContainerElement from '../Container/ContainerElement';
import {ContainerState} from '../../state/ContainerState';

const MAX_PORT_CLICK_DISTANCE = 8;

const {
  graphService,
  nodeDefinitionService,
  portRegistry,
  graphSelection,
  historyService,
  layoutService,
} = initializeOrGetServices();

interface GraphComponentState {
  graphState: GraphState;
  selection: string[];
  connectionCurves: ConnectionCurve[];
  mouseCoordinates: Coordinates;
  subscriptions: Subscription[];
  miniMapState: MiniMapState;
  viewportOffset: Coordinates;
}

class GraphComponent extends React.Component<{}, GraphComponentState> {
  private resizeHandler?: (() => void);
  private observer?: ResizeObserver;
  private canvasRef = createRef<HTMLCanvasElement>();
  private graphContainerRef = createRef<HTMLDivElement>();

  constructor(props: {}) {
    super(props);

    this.state = {
      graphState: graphService.snapshot,
      selection: graphSelection.items,
      connectionCurves: [],
      mouseCoordinates: emptyCoordinates(),
      subscriptions: [
        graphService.state$.pipe(
          switchMap(s => this.updateGraphState$(s)),
          switchMap(() => this.updateMiniMapState$()),
          switchMap(() => this.computeConnectionCurves$()),
        ).subscribe(),

        graphSelection.selection$.pipe(
          switchMap(this.updateSelection$),
        ).subscribe(),

        layoutService.state$.pipe(
          switchMap(s => this.updateViewportOffset$(s)),
          switchMap(() => this.updateMiniMapState$()),
          switchMap(() => this.computeConnectionCurves$()),
        ).subscribe(),
      ],
      miniMapState: getEmptyMiniMapState(),
      viewportOffset: layoutService.snapshot.viewportOffset,
    };
  }

  componentDidMount(): void {
    this.resizeHandler = () => {
      this.renderConnections();
      this.updateMiniMapState$().subscribe();
    };

    window.addEventListener('resize', this.resizeHandler);
    this.observeGraphContainerPositionChange();

    this.computeConnectionCurves$()
      .subscribe(() => this.renderConnections());

    this.updateMiniMapState$().subscribe();
  }

  private observeGraphContainerPositionChange(): void {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const graphContainer = this.graphContainerRef.current;

    if (graphContainer) {
      const callback: IntersectionObserverCallback = () => {
        this.computeConnectionCurves$()
          .subscribe(() => this.renderConnections());
      };

      // Value used to determine callback ratios. precision = 100 means we want
      // to detect changes when visible portion changes by something as small as 1/100.
      const precision = 500;

      const options: IntersectionObserverInit = {
        threshold: Array.from(Array(precision).keys()).map(n => n / precision),
      };

      this.observer = new IntersectionObserver(callback, options);
      this.observer.observe(graphContainer);
    }
  }

  componentWillUnmount(): void {
    this.state.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.resizeHandler != null) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }

    if (this.observer != null) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
    this.renderConnections();
  }

  shouldComponentUpdate(nextProps: Readonly<{}>, nextState: Readonly<GraphComponentState>, nextContext: any): boolean {
    const hasNodesChanges = () => Object.keys(nextState.graphState.nodes).length !== Object.keys(this.state.graphState.nodes).length
      || !arePrimitiveArraysEqual(Object.keys(nextState.graphState.nodes), Object.keys(this.state.graphState.nodes))
      || !areNodesVisuallySimilar(nextState.graphState.nodes, this.state.graphState.nodes);

    const hasElementOrderChanged = () => !arePrimitiveArraysEqual(nextState.graphState.elementOrder, this.state.graphState.elementOrder);

    const temporaryConnectionMoved = () => {
      const hasTemporaryConnection = nextState.graphState.temporaryConnectionPort != null;
      return hasTemporaryConnection
        && !areCoordinatesEqual(nextState.mouseCoordinates, this.state.mouseCoordinates);
    };

    const viewportBoundsChanged = () => {
      return !areBoundsEqual(nextState.miniMapState.viewportBounds, this.state.miniMapState.viewportBounds);
    }

    return !areCoordinatesEqual(nextState.viewportOffset, this.state.viewportOffset)
      || nextState.selection !== this.state.selection
      || nextState.connectionCurves !== this.state.connectionCurves
      || hasNodesChanges()
      || hasElementOrderChanged()
      || temporaryConnectionMoved()
      || viewportBoundsChanged();
  }

  private renderConnections(): void {
    const canvas = this.canvasRef.current;

    if (canvas != null) {
      canvas.width = canvas.clientWidth ?? 0;
      canvas.height = canvas.clientHeight ?? 0;
    }

    const ctx = canvas?.getContext('2d');

    if (ctx != null) {
      this.state.connectionCurves.forEach((connectionCurve) => {
        const selected = graphSelection.isSelected(connectionCurve.id);
        drawConnectionCurve(connectionCurve.points, selected, ctx);
      });

      if (this.state.graphState.temporaryConnectionPort != null) {
        const points = computeTemporaryConnectionCurve(this.state.mouseCoordinates, graphService, portRegistry);
        drawConnectionCurve(points, true, ctx);
      }
    }
  }

  render() {
    const graphAnchorStyle = getGraphAnchorStyle(this.state.viewportOffset);
    const containers = buildContainers(this.state.graphState);
    const nodes = buildNodes(this.state.graphState);

    return (
      <div
        className="GraphComponent"
        onMouseMove={evt => this.handleMouseMove(evt)}
        onKeyUp={evt => this.handleKeyUp(evt)}
        onPointerUp={evt => this.handlePointerUp(evt)}
        tabIndex={0}
      >
        <div className="CanvasContainer" ref={this.graphContainerRef}>
          <canvas ref={this.canvasRef}/>
        </div>
        <div className="GraphContainer"
             onPointerDown={evt => this.handlePointerDown(evt)}
        >
          <DragToMove
            onDragMove={e => layoutService.setViewportTranslate(e)}
            elementPosition={this.state.viewportOffset}
            buttons={[1]}
            style={({minHeight: '100vh'})}
          >
            <div className="GraphViewportAnchor" style={graphAnchorStyle}>
              {containers}
              {nodes}
            </div>
          </DragToMove>
        </div>
        <MiniMap
          miniMapState={this.state.miniMapState}
        />
      </div>
    );
  }

  private handlePointerDown(evt: any) {
    let somethingHit = false;
    const mouseCoordinates = {
      x: evt.clientX,
      y: evt.clientY,
    };

    if (!somethingHit) {
      for (const c of this.state.connectionCurves) {
        if (hitsConnectionCurve(mouseCoordinates, c, MAX_PORT_CLICK_DISTANCE)) {
          graphSelection.selectOnMouseDown(c.id, evt);
          somethingHit = true;
        }
      }
    }

    if (!somethingHit) {
      graphSelection.clearSelection();
    }
  }

  private handlePointerUp(evt: any) {
    const mouseCoordinates = {
      x: evt.clientX,
      y: evt.clientY,
    };

    if (this.state.graphState.temporaryConnectionPort) {
      const suitablePort = portRegistry.findSuitablePort(mouseCoordinates, this.state.graphState);

      if (suitablePort) {
        graphService.applyTemporaryConnection(suitablePort.id);
        historyService.pushTransaction(TransactionNames.CREATE_CONNECTION);
      } else {
        graphService.removeTemporaryConnection();
      }
    }
  }

  private handleMouseMove(e: any) {
    this.setState(state => ({
      ...state,
      mouseCoordinates: {
        x: e.clientX,
        y: e.clientY,
      },
    }));
  }

  private handleKeyUp(e: any) {
    if (e.code === 'Delete' || e.code === 'Backspace') {
      graphService.remove(graphSelection.items);
      historyService.pushTransaction(TransactionNames.DELETE_SELECTION);
      consumeEvent(e);
    }
  }

  private updateGraphState$ = (graphState: GraphState) => {
    return this.update$(s => ({...s, graphState}));
  };

  private computeConnectionCurves$ = () => {
    return this.update$(s => ({
      ...s,
      connectionCurves: computeConnectionCurves(graphService, portRegistry),
    }));
  };

  private updateSelection$ = (selection: string[]) => this.update$(s => ({...s, selection}));

  private updateViewportOffset$ = (layout: Layout) => this.update$(s => ({
    ...s,
    viewportOffset: layout.viewportOffset
  }));

  private updateMiniMapState$ = () => {
    return this.update$(s => ({
      ...s,
      miniMapState: computeMiniMapState(graphService.snapshot, layoutService.snapshot.viewportOffset),
    }));
  };

  private update$ = (stateMapper: (s: GraphComponentState) => GraphComponentState) => {
    return new Observable<GraphComponentState>(subscriber => {
      this.setState(stateMapper, () => {
        subscriber.next();
        subscriber.complete();
      });
    });
  };
}

function getGraphAnchorStyle(viewportOffset: Coordinates): any {
  const {x, y} = viewportOffset;
  return {transform: `translate(${x}px, ${y}px)`};
}

function buildNodes(graphState: GraphState): JSX.Element[] {
  return Object.entries(graphState.nodes)
    .map(([id, nodeState]: [string, NodeState]) => {
      const definition = nodeDefinitionService.getNodeDefinition(nodeState.kind);
      return (
        <Node key={id}
              nodeState={nodeState}
              zIndex={graphState.elementOrder.indexOf(id)}
              service={graphService}
              definition={definition}
              portRegistry={portRegistry}
              selected={graphSelection.isSelected(id)}
              selectedItemSet={graphSelection}
        />
      )
    });
}

function buildContainers(graphState: GraphState): JSX.Element[] {
  return Object.entries(graphState.containers ?? {})
    .map(([id, containerState]: [string, ContainerState]) => {
      return (
        <ContainerElement
          key={id}
          containerState={containerState}
          selected={graphSelection.isSelected(id)}
          zIndex={graphState.elementOrder.indexOf(id)}
        />
      )
    });
}

export default GraphComponent;
