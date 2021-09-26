import React, {createRef, useLayoutEffect} from 'react';
import './Node.css';
import DragToMove from '../../ui-utils/DragToMove';
import PropTypes from 'prop-types';
import EditableLabel from '../EditableLabel/EditableLabel';
import FoldButton from '../FoldButton/FoldButton';
import ParamPanel from '../ParamPanel/ParamPanel';
import {NodeState, PortId} from '../../state/NodeState';
import GraphService from '../../service/GraphService';
import {NodeDefinitionModel} from '../../model/NodeDefinition.model';
import {PortRegistry, ReferencedPort} from '../../service/PortRegistry';
import SelectedItemSet from '../../utils/SelectedItemSet';

interface NodeProps {
  nodeState: NodeState;
  service: GraphService;
  definition: NodeDefinitionModel;
  portRegistry: PortRegistry;
  selected: boolean;
  style?: any;
  selectedItemSet: SelectedItemSet<string>;
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

  const handlePointerDown = (evt: any) => {
    service.sendNodeToFront(nodeState.id);
    selectedItemSet.selectOnMouseDown(nodeState.id, evt);
  };

  const handlePointerUp = (evt: any) => {
    service.sendNodeToFront(nodeState.id);
    selectedItemSet.selectOnMouseUp(nodeState.id, evt);
  };

  const hasParams = Object.keys(definition.params).length > 0;

  const topPorts = buildReferencedPorts(nodeState.inputPorts);
  const bottomPorts = buildReferencedPorts(nodeState.outputPorts);

  useLayoutEffect(() => {
    portRegistry.registerPorts(...topPorts);
    portRegistry.registerPorts(...bottomPorts);
  });

  return (
    <div className={selected ? 'Node selected' : 'Node'}
         style={nodeStyle}
         onPointerDown={handlePointerDown}
         onPointerUp={handlePointerUp}
    >
      <DragToMove
        onDragMove={coordinates => service.setNodePosition(nodeState.id, coordinates)}
        elementPosition={nodeState.display.bounds}
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
