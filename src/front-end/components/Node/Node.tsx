import React, {createRef, useCallback, useLayoutEffect, useState} from 'react';
import './Node.css';
import DragToMove from '../../ui-utils/DragToMove';
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
import initializeOrGetServices from '../../service/helpers/initialize-services';
import {TransactionNames} from '../../service/HistoryService';

const {
  historyService,
  graphService,
  graphSelection,
  portRegistry,
} = initializeOrGetServices();

interface NodeProps {
  nodeState: NodeState;
  service: GraphService;
  definition: NodeDefinition | null;
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

  const nodeRef = createRef<HTMLDivElement>();
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

    const nodeElement = nodeRef.current;

    if (nodeElement) {
      const newHeight = nodeElement.getBoundingClientRect().height;
      if (newHeight !== nodeState.display.bounds.height) {
        graphService.setNodeHeight(nodeState.id, newHeight);
      }
    }
  }, [nodeRef, nodeState.id, bottomPorts, topPorts, nodeState.display.bounds.height]);

  const hasParams = definition && Object.keys(definition.params).length > 0;

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
      historyService.pushTransaction(TransactionNames.MOVE_SELECTION);
    }
  };

  const handleNameChange = (name: string) => {
    graphService.setNodeName(nodeState.id, name);
    historyService.pushTransaction(TransactionNames.SET_NODE_NAME);
  };

  const handleResize = (coordinates: Coordinates) => {
    graphService.setNodeWidth(nodeState.id, coordinates.x);
  };

  const dragHandlePosition: Coordinates = {
    x: nodeState.display.bounds.width,
    y: 0,
  };

  return (
    <div className={nodeClassName}
         ref={nodeRef}
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
        style={{display: 'flex'}}
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
              onChange={handleNameChange}
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
      <div className="NodeResizeBar">
        <DragToMove
          onDragMove={handleResize}
          elementPosition={dragHandlePosition}
          buttons={[0]}
          style={{width: '100%'}}
        />
      </div>
    </div>
  );
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

function getNodeStyle(nodeState: NodeState, zIndex: number): any {
  return {
    transform: `translate(${nodeState.display.bounds.x}px, ${nodeState.display.bounds.y}px)`,
    width: nodeState.display.bounds.width,
    zIndex,
  };
}

export default React.memo(Node);
