import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {squaredDist} from '../utils/numbers';
import Coordinates from '../../document/models/Coordinates';

export default function DragToMove(props: DragToMoveProps) {
  const {
    elementPosition,
    onDragMove,
    onDragStart,
    onDragEnd,
    children,
    style,
    className,
    buttons,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({x: 0, y: 0});
  const [dragStartPosition, setDragStartPosition] = useState({x: 0, y: 0});

  const handlePointerDown = (e: any) => {
    if (buttons.includes(e.button)) {
      setIsDragging(true);
      setStartPosition(elementPosition);
      setDragStartPosition({x: e.screenX, y: e.screenY});
      if (onDragStart) onDragStart();
      e.stopPropagation();
    }
  };

  const handlePointerUp = useCallback((e: any) => {
    if (isDragging) {
      setIsDragging(false);

      const dragDistanceSquared = squaredDist(dragStartPosition, {
        x: e.screenX,
        y: e.screenY,
      });

      if (onDragEnd) onDragEnd({
        dragDistanceSquared,
      });
    }
  }, [isDragging, setIsDragging, onDragEnd, dragStartPosition]);

  const handlePointerMove = useCallback((e: any) => {
    if (isDragging) {
      const newPosition = {
        x: startPosition.x + (e.screenX - dragStartPosition.x) / window.devicePixelRatio,
        y: startPosition.y + (e.screenY - dragStartPosition.y) / window.devicePixelRatio,
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
  }, [handlePointerMove, handlePointerUp]);

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

const {func, element, shape, string, array} = PropTypes;

DragToMove.propTypes = {
  onDragMove: func.isRequired,
  onDragStart: func,
  onDragEnd: func,
  elementPosition: shape({}).isRequired,
  buttons: array.isRequired,
  children: element,
  style: shape({}),
  className: string,
}

interface DragToMoveProps {
  elementPosition: Coordinates;
  onDragStart?: () => void;
  onDragMove: (newPosition: Coordinates) => void;
  onDragEnd?: (info: DragEndInfo) => void;
  children?: any;
  style?: any;
  className?: string;
  buttons: number[];
}

interface DragEndInfo {
  dragDistanceSquared: number;
}
