import Bounds from '../../../document/models/Bounds';
import Coordinates from '../../../document/models/Coordinates';
import DragToMove from '../../ui-utils/DragToMove';
import EditableLabel from '../EditableLabel/EditableLabel';
import React from 'react';

interface BaseContainerElementProps {
  className: string;
  headerClassName: string;
  labelClassName: string;
  bounds: Bounds;
  zIndex: number;
  selected: boolean;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setSize: (size: Coordinates) => void;
  handlePointerDown: (evt: any) => void;
  handleMoved: (evt: any) => void;
  handleDragStart: (evt: any) => void;
  onRename: (name: string) => void;
  name: string;
}

export default function BaseContainerElement(props: BaseContainerElementProps) {
  const {
    className,
    bounds,
    selected,
    zIndex,
    setWidth,
    setHeight,
    setSize,
    handlePointerDown,
    handleDragStart,
    handleMoved,
    onRename,
    name,
    headerClassName,
    labelClassName,
  } = props;

  const style = getStyle(bounds, zIndex);

  return (
    <div className={className + (selected ? ' selected' : '')}
         style={style}
         onPointerDown={handlePointerDown}
    >
      <ResizeBorders
        bounds={bounds}
        setWidth={setWidth}
        setHeight={setHeight}
        setSize={setSize}
      />
      <div className={headerClassName}>
        <DragToMove
          onDragStart={handleDragStart}
          onDragMove={handleMoved}
          elementPosition={bounds}
          buttons={[0]}
          style={{width: '100%', display: 'flex', flexGrow: 1}}
        >
          <EditableLabel
            className={labelClassName}
            onChange={onRename}
            value={name}
            inputStyle={{flexGrow: 1}}
          />
        </DragToMove>
      </div>
    </div>
  );
}


function getStyle(bounds: Bounds, zIndex: number): any {
  return {
    transform: `translate(${bounds.x}px, ${bounds.y}px)`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    zIndex,
  };
}

function ResizeBorders(props: any): JSX.Element {
  const {
    bounds,
    setWidth,
    setHeight,
    setSize,
  } = props;

  return (
    <div className="ContainerHandles">
      <div
        className="ContainerRightResizeHandle"
        key="rightHandle"
      >
        <DragToMove
          onDragMove={(coordinates) => setWidth(coordinates.x)}
          elementPosition={{x: bounds.width, y: 0}}
          buttons={[0]}
          style={{width: '100%'}}
        />
      </div>
      <div
        className="ContainerBottomResizeHandle"
        key="bottomHandle"
      >
        <DragToMove
          onDragMove={(coordinates) => setHeight(coordinates.y)}
          elementPosition={{x: 0, y: bounds.height}}
          buttons={[0]}
          style={{width: '100%'}}
        />
      </div>
      <div
        className="ContainerBottomRightResizeHandle"
        key="bottomRightHandle"
      >
        <DragToMove
          onDragMove={(coordinates) => setSize(coordinates)}
          elementPosition={{x: bounds.width, y: bounds.height}}
          buttons={[0]}
          style={{width: '100%'}}
        />
      </div>
    </div>
  );
}
