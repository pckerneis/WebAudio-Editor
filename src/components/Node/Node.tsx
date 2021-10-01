import React, {createRef, useCallback, useLayoutEffect, useState} from 'react';
import './Node.css';
import DragToMove from '../../ui-utils/DragToMove';
import PropTypes from 'prop-types';
import EditableLabel from '../EditableLabel/EditableLabel';
import FoldButton from '../FoldButton/FoldButton';
import ParamPanel from '../ParamPanel/ParamPanel';
import {NodeId, NodeState} from '../../state/NodeState';
import GraphService from '../../service/GraphService';
import {NodeDefinitionModel} from '../../model/NodeDefinition.model';
import {PortComponentRegistry, ReferencedPort} from '../../service/PortComponentRegistry';
import SelectedItemSet from '../../utils/SelectedItemSet';
import Coordinates from '../../model/Coordinates';
import Bounds from '../../model/Bounds';
import {buildReferencedPorts} from './Port';

interface NodeProps {
  nodeState: NodeState;
  service: GraphService;
  definition: NodeDefinitionModel;
  portRegistry: PortComponentRegistry;
  selected: boolean;
  style?: any;
  selectedItemSet: SelectedItemSet<string>;
}

function buildPorts(nodeState: NodeState, service: GraphService): { bottomPorts: ReferencedPort[], topPorts: ReferencedPort[] } {
  const topPorts = buildReferencedPorts(nodeState.inputPorts.map(p => p.id), service);
  const bottomPorts = buildReferencedPorts(nodeState.outputPorts.map(p => p.id), service);
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
    minWidth: nodeState.display.bounds.width,
    minHeight: nodeState.display.bounds.height,
  };

  const [startPosition, setStartPosition] = useState({} as Bounds);
  const [positionByItem, setPositionByItem] = useState({} as { [id: NodeId]: Bounds });

  const handlePointerUp = useCallback((evt: any) => {
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
    if (! selectedItemSet.isSelected(nodeState.id)) {
      selectedItemSet.setUniqueSelection(nodeState.id);
    }

    const selectedNodes = selectedItemSet.items.map(id => service.snapshot.nodes[id]).filter(Boolean) as NodeState[];
    const positionByItem = {} as { [id: NodeId]: Bounds };
    selectedNodes.forEach(node => positionByItem[node.id] = node.display.bounds);
    setPositionByItem(positionByItem);

    setStartPosition(nodeState.display.bounds);
  }, [nodeState.display.bounds, service.snapshot.nodes, nodeState.id, selectedItemSet]);

  const {topPorts, bottomPorts} = buildPorts(nodeState, service);

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

      return {id: p.id, ref, template};
    }) : [];

  portRegistry.registerPorts(...hiddenParamPorts);

  return (
    <div className={selected ? 'Node selected' : 'Node'}
         style={nodeStyle}
         onPointerUp={handlePointerUp}
    >
      {
        nodeState.display.folded
        && hasParams
        && hiddenParamPorts.map(p => p.template)
      }
      <DragToMove
        onDragStart={handleDragStart}
        onDragMove={handleMoved}
        elementPosition={nodeState.display.bounds}
        buttons={[0]}
        style={({display: 'flex'})}
      >
        <div className="NodeContent">
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
              nodeId={nodeState.id}
              paramValues={nodeState.paramValues}
              paramPorts={nodeState.paramPorts}
              paramDefinitions={definition.params}
              portRegistry={portRegistry}
              service={service}
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
