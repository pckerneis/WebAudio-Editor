import React from 'react';
import './Node.css';
import DragToMove from '../../ui-utils/DragToMove';
import PropTypes from 'prop-types';
import EditableLabel from '../EditableLabel/EditableLabel';
import FoldButton from '../FoldButton/FoldButton';

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
    minWidth: `${nodeModel.display.bounds.width}`,
    minHeight: `${nodeModel.display.bounds.height}`,
  };

  const handlePointerDown = () => {
    service.sendNodeToFront(nodeModel.id);
  };

  return (
    <div style={nodeStyle}
         onPointerDown={handlePointerDown}>
      <DragToMove
        className="Node"
        onDragMove={setNodePosition}
        onDragStart={handlePointerDown}
        elementPosition={nodeModel.display.bounds}
        style={({display: 'flex'})}
      >
        <div style={({display: 'flex'})}>
          <FoldButton
            style={({ margin: '0 4px' })}
            folded={nodeModel.display.folded}
            onButtonClick={() => service.toggleNodeFoldState(nodeModel.id)}
          />
          <EditableLabel
            value={nodeModel.name}
            onChange={(name) => service.setNodeName(nodeModel.id, name)}/>
        </div>
      </DragToMove>
    </div>
  );
}

const {shape} = PropTypes;

Node.propTypes = {
  nodeModel: shape({}).isRequired,
  service: shape({}).isRequired,
}
