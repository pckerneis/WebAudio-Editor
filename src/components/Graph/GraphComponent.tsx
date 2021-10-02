import React, {createRef} from 'react';
import './GraphComponent.css';
import DragToMove from '../../ui-utils/DragToMove';
import Node from '../Node/Node';
import {NodeDefinitionModel} from '../../model/NodeDefinition.model';
import {NodeState} from '../../state/NodeState';
import {Observable, Subscription, switchMap} from 'rxjs';
import {GraphState} from '../../state/GraphState';
import Coordinates from '../../model/Coordinates';
import {
  computeConnectionCurves,
  computeTemporaryConnectionCurve,
  ConnectionCurve,
  drawConnectionCurve,
  hitsConnectionCurve
} from '../../ui-utils/ConnectionCurve';
import {consumeEvent} from '../../ui-utils/events';
import initializeOrGetServices from '../../service/initialize-services';

const MAX_PORT_CLICK_DISTANCE = 8;

const {
  graphService,
  nodeDefinitionService,
  portRegistry,
  graphSelection
} = initializeOrGetServices();

interface GraphComponentState {
  graphState: GraphState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selection: string[];
  connectionCurves: ConnectionCurve[];
  mouseCoordinates: Coordinates | null;
  subscriptions: Subscription[];
}

class GraphComponent extends React.Component<{}, GraphComponentState> {
  private resizeHandler?: (() => void);

  constructor(props: {}) {
    super(props);

    this.state = {
      graphState: graphService.snapshot,
      canvasRef: createRef(),
      selection: graphSelection.items,
      connectionCurves: [],
      mouseCoordinates: null,
      subscriptions: [
        graphService.state$.pipe(
          switchMap(s => this.updateGraphState$(s)),
          switchMap(() => this.computeConnectionCurves$()),
        ).subscribe(),

        graphSelection.selection$.pipe(
          switchMap(this.updateSelection$)
        ).subscribe(),
      ]
    };
  }

  componentWillUnmount(): void {
    this.state.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.resizeHandler != null) {
      window.removeEventListener('resize', this.resizeHandler!);
      this.resizeHandler = undefined;

    }
  }

  componentDidMount(): void {
    this.resizeHandler = () => this.renderConnections();
    window.addEventListener('resize', this.resizeHandler);

    this.computeConnectionCurves$()
      .subscribe(() => this.renderConnections());
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
      this.state.connectionCurves.forEach((connectionCurve) => {
        const selected = graphSelection.isSelected(connectionCurve.id);
        drawConnectionCurve(connectionCurve.points, selected, ctx);
      });

      if (this.state.graphState.temporaryConnectionPort != null && this.state.mouseCoordinates != null) {
        const points = computeTemporaryConnectionCurve(this.state.mouseCoordinates, graphService, portRegistry);
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
        const suitablePort = portRegistry.findSuitablePort(mouseCoordinates, this.state.graphState);

        if (suitablePort) {
          graphService.createOrApplyTemporaryConnection(suitablePort.id);
          somethingHit = true;
        } else {
          graphService.removeTemporaryConnection();
        }
      }

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

    const handleMouseMove = (e: any) => {
      this.setState(state => ({
        ...state,
        mouseCoordinates: {
          x: e.clientX,
          y: e.clientY,
        },
      }));
    };

    const handleKeyUp = (e: any) => {
      if (e.code === 'Delete' || e.code === 'Backspace') {
        graphService.remove(graphSelection.items);
        consumeEvent(e);
      }
    }

    return (
      <div
        className="GraphComponent"
        onMouseMove={handleMouseMove}
        onKeyUp={handleKeyUp}
        tabIndex={0}
      >
        <div className="CanvasContainer">
          <canvas ref={this.state.canvasRef}/>
        </div>
        <div className="GraphContainer" onPointerDown={handlePointerDown}>
          <DragToMove
            onDragMove={e => graphService.setViewportTranslate(e)}
            elementPosition={graphService.snapshot.viewportOffset}
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

  private updateGraphState$ = (graphState: GraphState) => {
    return this.update$(s => ({...s, graphState}));
  }

  private computeConnectionCurves$ = () => {
    return this.update$(s => ({
      ...s,
      connectionCurves: computeConnectionCurves(graphService, portRegistry),
    }));
  }

  private updateSelection$ = (selection: string[]) => this.update$(s => ({...s, selection}));

  private update$ = (stateMapper: (s: GraphComponentState) => GraphComponentState) => {
    return new Observable<GraphComponentState>(subscriber => {
      this.setState(stateMapper, () => {
        subscriber.next();
        subscriber.complete();
      });
    });
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
              service={graphService}
              definition={definition}
              portRegistry={portRegistry}
              selected={graphSelection.isSelected(id)}
              selectedItemSet={graphSelection}
        />
      )
    });
}

export default GraphComponent;
