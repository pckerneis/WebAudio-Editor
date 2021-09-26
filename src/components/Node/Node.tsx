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

export default function Node(props: any) {
  const {
    nodeState,
    service,
    definition,
    portRegistry,
  } = props as {
    nodeState: NodeState,
    service: GraphService,
    definition: NodeDefinitionModel,
    portRegistry: PortRegistry,
  };

  const nodeStyle = {
    ...props.style,
    transform: `translate(${nodeState.display.bounds.x}px, ${nodeState.display.bounds.y}px)`,
    width: nodeState.display.bounds.width,
    minHeight: nodeState.display.bounds.height,
  };

  const handlePointerDown = () => {
    service.sendNodeToFront(nodeState.id);
  };

  const hasParams = Object.keys(definition.params).length > 0;

  const topPorts = buildReferencedPorts(nodeState.inputPorts);
  const bottomPorts = buildReferencedPorts(nodeState.outputPorts);

  useLayoutEffect(() => {
    portRegistry.registerPorts(...topPorts);
    portRegistry.registerPorts(...bottomPorts);
  });

  return (
    <div className="Node"
         style={nodeStyle}
         onPointerDown={handlePointerDown}>
      <DragToMove
        onDragMove={coordinates => service.setNodePosition(nodeState.id, coordinates)}
        onDragStart={handlePointerDown}
        elementPosition={nodeState.display.bounds}
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

const {shape} = PropTypes;

Node.propTypes = {
  nodeState: shape({}).isRequired,
  definition: shape({}).isRequired,
  service: shape({}).isRequired,
  portRegistry: shape({}).isRequired,
  style: shape({}),
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
