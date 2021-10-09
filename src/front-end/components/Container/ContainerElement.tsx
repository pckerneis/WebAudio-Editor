import './ContainerElement.css';
import React, {useCallback, useState} from 'react';
import DragToMove from '../../ui-utils/DragToMove';
import EditableLabel from '../EditableLabel/EditableLabel';
import {ContainerState} from '../../state/ContainerState';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import Bounds from '../../../document/models/Bounds';
import Coordinates from '../../../document/models/Coordinates';
import {NodeState} from '../../state/NodeState';

const {
  graphService,
  graphSelection,
} = initializeOrGetServices();

interface TopRightBottomLeft {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function asTopRightBottomLeft(bounds: Bounds): TopRightBottomLeft {
  return {
    top: bounds.y,
    right: bounds.x + bounds.width,
    bottom: bounds.y + bounds.height,
    left: bounds.x,
  };
}

function boundsIntersect(first: Bounds, second: Bounds): boolean {
  const r1 = asTopRightBottomLeft(first);
  const r2 = asTopRightBottomLeft(second);

  return !(r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top);
}

function findContainedNodes(containerState: ContainerState, nodes: { [p: string]: NodeState }): NodeState[] {
  return Object.values(nodes)
    .filter(node => boundsIntersect(containerState.display.bounds, node.display.bounds));
}

export default function ContainerElement(props: ContainerElementProps) {
  const {
    containerState,
    selected,
  } = props;

  const [startPosition, setStartPosition] = useState({} as Bounds);
  const [positionByItem, setPositionByItem] = useState({} as { [id: string]: Bounds });

  const bounds = containerState.display.bounds;
  const style = getStyle(bounds, -100);

  const setWidth = (width: number) => graphService.setContainerWidth(containerState.id, width);
  const setHeight = (height: number) => graphService.setContainerHeight(containerState.id, height);
  const setSize = (size: Coordinates) => graphService.setContainerSize(containerState.id, size.x, size.y);

  const handlePointerDown = useCallback((evt: any) => {
    graphService.sendContainerToFront(containerState.id);
    graphSelection.selectOnMouseDown(containerState.id, evt);
  }, [containerState.id]);

  const handleMoved = useCallback((coordinates: Coordinates) => {
    if (graphSelection.isSelected(containerState.id)) {
      const offsetX = startPosition.x - coordinates.x;
      const offsetY = startPosition.y - coordinates.y;

      Object.entries(positionByItem).forEach(([id, bounds]) => {
        graphService.setNodePosition(id, {
          x: bounds.x - offsetX,
          y: bounds.y - offsetY,
        });
      });

      graphService.setContainerPosition(containerState.id, coordinates);
    }
  }, [containerState.id, positionByItem, startPosition.x, startPosition.y]);

  const handleDragStart = useCallback((evt) => {
    if (!graphSelection.isSelected(containerState.id)) {
      graphSelection.addToSelection(containerState.id);

      if (!evt.ctrlKey) {
        const containedNodes = findContainedNodes(containerState, graphService.snapshot.nodes);
        containedNodes.forEach(n => graphSelection.addToSelection(n.id));
      }
    }

    const selectedNodes = graphSelection.items.map(id => graphService.snapshot.nodes[id]).filter(Boolean) as NodeState[];
    const positionByItem = {} as { [id: string]: Bounds };
    selectedNodes.forEach(node => positionByItem[node.id] = node.display.bounds);
    setPositionByItem(positionByItem);

    setStartPosition(containerState.display.bounds);
  }, [containerState.display.bounds, containerState.id]);

  return (
    <div className={'ContainerElement' + (selected ? ' selected' : '')}
         style={style}
         onPointerDown={handlePointerDown}
    >
      <ResizeBorders
        bounds={bounds}
        setWidth={setWidth}
        setHeight={setHeight}
        setSize={setSize}
      />
      <div className="ContainerHeader">
        <DragToMove
          onDragStart={handleDragStart}
          onDragMove={handleMoved}
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
  zIndex: number;
  selected: boolean;
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
