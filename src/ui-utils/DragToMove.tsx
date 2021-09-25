import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';

export default function DragToMove(props: any) {
  const {
    elementPosition,
    onDragMove,
    onDragStart,
    children,
    style,
    className,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({x: 0, y: 0});
  const [dragStartPosition, setDragStartPosition] = useState({x: 0, y: 0});

  const handlePointerDown = (e: any) => {
    setIsDragging(true);
    setStartPosition(elementPosition);
    setDragStartPosition({x: e.screenX, y: e.screenY});
    if (onDragStart) onDragStart();
    e.stopPropagation();
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = useCallback((e: any) => {
    if (isDragging) {
      const newPosition = {
        x: startPosition.x + (e.screenX - dragStartPosition.x),
        y: startPosition.y + (e.screenY - dragStartPosition.y),
      }
      onDragMove(newPosition);
    }
  }, [dragStartPosition.x, dragStartPosition.y, isDragging, onDragMove, startPosition.x, startPosition.y]);

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerMove]);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}

const {func, element, shape, string} = PropTypes;

DragToMove.propTypes = {
  onDragMove: func.isRequired,
  onDragStart: func,
  elementPosition: shape({}).isRequired,
  children: element,
  style: shape({}),
  className: string,
}
