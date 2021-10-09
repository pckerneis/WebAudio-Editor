import './ContainerElement.css';
import React from 'react';
import DragToMove from '../../ui-utils/DragToMove';
import EditableLabel from '../EditableLabel/EditableLabel';
import {ContainerState} from '../../state/ContainerState';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import Bounds from '../../../document/models/Bounds';
import Coordinates from '../../../document/models/Coordinates';

const {
  graphService,
} = initializeOrGetServices();

export default function ContainerElement(props: ContainerElementProps) {
  const {
    containerState,
  } = props;

  const bounds = containerState.display.bounds;
  const style = getStyle(bounds, -100);

  const setWidth = (width: number) => graphService.setContainerWidth(containerState.id, width);
  const setHeight = (height: number) => graphService.setContainerHeight(containerState.id, height);
  const setSize = (size: Coordinates) => graphService.setContainerSize(containerState.id, size.x, size.y);

  return (
    <div className="ContainerElement" style={style}>
      <ResizeBorders
        bounds={bounds}
        setWidth={setWidth}
        setHeight={setHeight}
        setSize={setSize}
      />
      <div className="ContainerHeader">
        <DragToMove
          onDragMove={(evt) => graphService.setContainerPosition(containerState.id, evt)}
          elementPosition={bounds}
          buttons={[0]}
          style={{width: '100%', display: 'flex', flexGrow: 1}}
        >
          <EditableLabel
            className="ContainerEditableLabel"
            onChange={(value) => graphService.setContainerName(containerState.id, value)}
            value={containerState.name}
            inputStyle={{flexGrow: 1}}
          />
        </DragToMove>
      </div>
    </div>
  );
}

interface ContainerElementProps {
  containerState: ContainerState;
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
