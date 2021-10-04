import React, {createRef, useCallback, useLayoutEffect, useState} from 'react';
import './Node.css';
import DragToMove from '../../ui-utils/DragToMove';
import PropTypes from 'prop-types';
import EditableLabel from '../EditableLabel/EditableLabel';
import FoldButton from '../FoldButton/FoldButton';
import ParamPanel from '../ParamPanel/ParamPanel';
import {NodeState} from '../../state/NodeState';
import GraphService from '../../service/GraphService';
import {PortComponentRegistry, ReferencedPort} from '../../service/PortComponentRegistry';
import SelectedItemSet from '../../utils/SelectedItemSet';
import Coordinates from '../../../document/models/Coordinates';
import Bounds, {areBoundsEqual} from '../../../document/models/Bounds';
import {buildReferencedPorts} from './Port';
import {NodeDefinition} from '../../../document/node-definitions/NodeDefinition';
import initializeOrGetServices from '../../service/initialize-services';
import {filter, map, Observable, pluck} from 'rxjs';
import WrapAsState from '../../ui-utils/WrapAsState';

const {historyService, graphService, graphSelection, portRegistry} = initializeOrGetServices();

interface NodeProps {
  nodeState: NodeState;
  service: GraphService;
  definition: NodeDefinition;
  portRegistry: PortComponentRegistry;
  selected: boolean;
  selectedItemSet: SelectedItemSet<string>;
  zIndex: number;
}

function buildPorts(nodeState: NodeState, service: GraphService): { bottomPorts: ReferencedPort[], topPorts: ReferencedPort[] } {
  const topPorts = buildReferencedPorts(nodeState.inputPorts.map(p => p.id), service);
  const bottomPorts = buildReferencedPorts(nodeState.outputPorts.map(p => p.id), service);
  return {topPorts, bottomPorts};
}

function Node(props: NodeProps) {
  const {
    nodeState,
    definition,
    selected,
    zIndex,
  } = props;

  const node$ = graphService.state$.pipe(
    pluck('nodes'),
    map((nodes) => nodes[nodeState.id]),
    filter(Boolean),
  ) as Observable<NodeState>;
  WrapAsState(node$, null);

  const nodeStyle = getNodeStyle(nodeState, zIndex);
  const [startPosition, setStartPosition] = useState({} as Bounds);
  const [positionByItem, setPositionByItem] = useState({} as { [id: string]: Bounds });

  const handlePointerDown = useCallback((evt: any) => {
    graphService.sendNodeToFront(nodeState.id);
    graphSelection.selectOnMouseDown(nodeState.id, evt);
  }, [nodeState.id]);

  const handleMoved = useCallback((coordinates: Coordinates) => {
    if (graphSelection.isSelected(nodeState.id)) {
      const offsetX = startPosition.x - coordinates.x;
      const offsetY = startPosition.y - coordinates.y;

      Object.entries(positionByItem).forEach(([id, bounds]) => {
        graphService.setNodePosition(id, {
          x: bounds.x - offsetX,
          y: bounds.y - offsetY,
        });
      });
    }
  }, [nodeState.id, positionByItem, startPosition.x, startPosition.y]);

  const handleDragStart = useCallback(() => {
    if (!graphSelection.isSelected(nodeState.id)) {
      graphSelection.setUniqueSelection(nodeState.id);
    }

    const selectedNodes = graphSelection.items.map(id => graphService.snapshot.nodes[id]).filter(Boolean) as NodeState[];
    const positionByItem = {} as { [id: string]: Bounds };
    selectedNodes.forEach(node => positionByItem[node.id] = node.display.bounds);
    setPositionByItem(positionByItem);

    setStartPosition(nodeState.display.bounds);
  }, [nodeState.display.bounds, nodeState.id]);

  const {topPorts, bottomPorts} = buildPorts(nodeState, graphService);

  useLayoutEffect(() => {
    portRegistry.registerPorts(...topPorts);
    portRegistry.registerPorts(...bottomPorts);
  });

  const hasParams = Object.keys(definition.params).length > 0;

  const hiddenParamPorts = nodeState.display.folded ?
    Object.values(nodeState.paramPorts).map((p) => {
      const ref = createRef<HTMLDivElement>();
      const template = (
        <div className="HiddenParamPort"
             ref={ref}
             key={p.id + '_hiddenPort'}>
        </div>);

      return {id: p.id, ref, template, hidden: true};
    }) : [];

  portRegistry.registerPorts(...hiddenParamPorts);

  const nodeClassName = selected ? 'Node node-shadow selected' : 'Node node-shadow';

  const handleDragEnd = ({dragDistanceSquared}: { dragDistanceSquared: number }) => {
    if (dragDistanceSquared > 1) {
      historyService.pushTransaction('move selection');
    }
  };

  return (
    <div className={nodeClassName}
         style={nodeStyle}
         onPointerDown={handlePointerDown}
    >
      {
        nodeState.display.folded
        && hasParams
        && hiddenParamPorts.map(p => p.template)
      }
      <DragToMove
        onDragStart={handleDragStart}
        onDragMove={handleMoved}
        onDragEnd={handleDragEnd}
        elementPosition={nodeState.display.bounds}
        buttons={[0]}
        style={({display: 'flex'})}
      >
        <div className="NodeContent"
             onPointerDown={handlePointerDown}>
          <div style={({display: 'flex', width: '100%'})}>
            {
              hasParams
              && <FoldButton
                style={({margin: '0 4px'})}
                folded={nodeState.display.folded}
                onButtonClick={() => graphService.toggleNodeFoldState(nodeState.id)}
              />
            }
            <EditableLabel
              className="NodeLabel"
              value={nodeState.name}
              onChange={(name) => graphService.setNodeName(nodeState.id, name)}
            />
          </div>
          {
            !nodeState.display.folded
            && hasParams
            && <ParamPanel
              nodeId={nodeState.id}
              paramValues={nodeState.paramValues}
              paramPorts={nodeState.paramPorts}
              paramDefinitions={definition.params}
            />
          }
        </div>
      </DragToMove>
      <div className="TopPortsContainer">
        {topPorts.map(rp => rp.template)}
      </div>
      <div className="BottomPortsContainer">
        {bottomPorts.map(rp => rp.template)}
      </div>
    </div>
  );
}

const {shape, bool, number} = PropTypes;

Node.propTypes = {
  nodeState: shape({}).isRequired,
  definition: shape({}).isRequired,
  style: shape({}),
  selected: bool,
  zIndex: number,
}

type Nodes = { [id: string]: NodeState };

export function areNodesVisuallySimilar(previous: Nodes, next: Nodes): boolean {
  return Object.values(previous).every(first => {
    const second = next[first.id];

    if (!second) {
      return false;
    }

    if (first.display.folded !== second.display.folded) {
      return false;
    }

    return areBoundsEqual(first.display.bounds, second.display.bounds);
  });
}

function getNodeStyle(nodeState: NodeState, zIndex: number): { minHeight: number; transform: string; minWidth: number; zIndex: number } {
  return {
    transform: `translate(${nodeState.display.bounds.x}px, ${nodeState.display.bounds.y}px)`,
    minWidth: nodeState.display.bounds.width,
    minHeight: nodeState.display.bounds.height,
    zIndex,
  };
}

export default React.memo(Node);
