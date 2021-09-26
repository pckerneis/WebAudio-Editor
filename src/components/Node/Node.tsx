import React, {createRef, useCallback, useLayoutEffect, useState} from 'react';
import './Node.css';
import DragToMove from '../../ui-utils/DragToMove';
import PropTypes from 'prop-types';
import EditableLabel from '../EditableLabel/EditableLabel';
import FoldButton from '../FoldButton/FoldButton';
import ParamPanel from '../ParamPanel/ParamPanel';
import {NodeId, NodeState, PortId} from '../../state/NodeState';
import GraphService from '../../service/GraphService';
import {NodeDefinitionModel} from '../../model/NodeDefinition.model';
import {PortRegistry, ReferencedPort} from '../../service/PortRegistry';
import SelectedItemSet from '../../utils/SelectedItemSet';
import Coordinates from '../../model/Coordinates';
import Bounds from '../../model/Bounds';

interface NodeProps {
  nodeState: NodeState;
  service: GraphService;
  definition: NodeDefinitionModel;
  portRegistry: PortRegistry;
  selected: boolean;
  style?: any;
  selectedItemSet: SelectedItemSet<string>;
}

function buildPorts(nodeState: NodeState): {bottomPorts: ReferencedPort[], topPorts: ReferencedPort[]} {
  const topPorts = buildReferencedPorts(nodeState.inputPorts);
  const bottomPorts = buildReferencedPorts(nodeState.outputPorts);
  return {topPorts, bottomPorts};
}

export default function Node(props: NodeProps) {
  const {
    nodeState,
    service,
    definition,
    portRegistry,
    selected,
    selectedItemSet
  } = props;

  const nodeStyle = {
    ...props.style,
    transform: `translate(${nodeState.display.bounds.x}px, ${nodeState.display.bounds.y}px)`,
    width: nodeState.display.bounds.width,
    minHeight: nodeState.display.bounds.height,
  };

  const [startPosition, setStartPosition] = useState({} as Bounds);
  const [positionByItem, setPositionByItem] = useState({} as { [id: NodeId]: Bounds });

  const handlePointerDown = useCallback((evt: any) => {
    service.sendNodeToFront(nodeState.id);
    selectedItemSet.selectOnMouseDown(nodeState.id, evt);
  }, [service, selectedItemSet, nodeState.id]);

  const handleMoved = useCallback((coordinates: Coordinates) => {
    if (selectedItemSet.isSelected(nodeState.id)) {
      const offsetX = startPosition.x - coordinates.x;
      const offsetY = startPosition.y - coordinates.y;

      Object.entries(positionByItem).forEach(([id, bounds]) => {
        service.setNodePosition(id, {
          x: bounds.x - offsetX,
          y: bounds.y - offsetY,
        });
      });
    }
  }, [selectedItemSet, nodeState.id, positionByItem, service, startPosition.x, startPosition.y]);

  const handleDragStart = useCallback(() => {
    const selectedNodes = selectedItemSet.items.map(id => service.snapshot.nodes[id]).filter(Boolean) as NodeState[];
    const positionByItem = {} as { [id: NodeId]: Bounds };
    selectedNodes.forEach(node => positionByItem[node.id] = node.display.bounds);
    setPositionByItem(positionByItem);

    setStartPosition(nodeState.display.bounds);
  }, [nodeState.display.bounds]);

  const {topPorts, bottomPorts} = buildPorts(nodeState);

  useLayoutEffect(() => {
    portRegistry.registerPorts(...topPorts);
    portRegistry.registerPorts(...bottomPorts);
  });

  const hasParams = Object.keys(definition.params).length > 0;

  return (
    <div className={selected ? 'Node selected' : 'Node'}
         style={nodeStyle}
         onPointerDown={handlePointerDown}
    >
      <DragToMove
        onDragStart={handleDragStart}
        onDragMove={handleMoved}
        elementPosition={nodeState.display.bounds}
        style={({display: 'flex'})}
      >
        <div className="NodeContent"
             onPointerDown={handlePointerDown}
        >
          <div style={({display: 'flex', width: '100%'})}>
            {
              hasParams
              && <FoldButton
                style={({margin: '0 4px'})}
                folded={nodeState.display.folded}
                onButtonClick={() => service.toggleNodeFoldState(nodeState.id)}
              />
            }
            <EditableLabel
              className="NodeLabel"
              value={nodeState.name}
              onChange={(name) => service.setNodeName(nodeState.id, name)}
            />
          </div>
          {
            !nodeState.display.folded
            && hasParams
            && <ParamPanel
              paramValues={nodeState.paramValues}
              paramDefinitions={definition.params}
              style={({marginBottom: '5px'})}
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

const {shape, bool} = PropTypes;

Node.propTypes = {
  nodeState: shape({}).isRequired,
  definition: shape({}).isRequired,
  service: shape({}).isRequired,
  portRegistry: shape({}).isRequired,
  selectedItemSet: shape({}).isRequired,
  style: shape({}),
  selected: bool,
}

function buildReferencedPorts(portIds: PortId[]): ReferencedPort[] {
  return Array(portIds.length)
    .fill(0)
    .map((_, idx) => {
      const ref = createRef<HTMLDivElement>();
      const template = (<div key={idx} className="Port" ref={ref}> </div>);
      return {id: portIds[idx], ref, template};
    });
}
