import React from 'react';
import DragToMove from './ui-utils/DragToMove';
import PropTypes from 'prop-types';
import EditableLabel from './EditableLabel';

export default function Node(props: any) {
  const {
    nodeModel,
    service,
  } = props;

  const setNodePosition = (coordinates: any) => {
    service.setNodePosition(nodeModel.id, coordinates);
  }

  const nodeStyle = {
    transform: `translate(${nodeModel.display.bounds.x}px, ${nodeModel.display.bounds.y}px)`,
  };

  const handlePointerDown = () => {
    service.sendNodeToFront(nodeModel.id);
  };

  return (
    <div style={nodeStyle}
         onPointerDown={handlePointerDown}>
      <DragToMove className="Node"
                  onDragMove={setNodePosition}
                  onDragStart={handlePointerDown}
                  elementPosition={nodeModel.display.bounds}
                  style={({display: 'flex'})}>
        <EditableLabel value={nodeModel.name}
                       onChange={(name) => service.setNodeName(nodeModel.id, name)}/>
      </DragToMove>
    </div>
  );
}

const {shape} = PropTypes;

Node.propTypes = {
  nodeModel: shape({}).isRequired,
  service: shape({}).isRequired,
}
