import './ContainerElement.css';
import React, {useCallback, useState} from 'react';
import {ContainerState} from '../../state/ContainerState';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import Bounds, {boundsIntersect} from '../../../document/models/Bounds';
import Coordinates from '../../../document/models/Coordinates';
import {NodeState} from '../../state/NodeState';
import BaseContainerElement from '../BaseContainer/BaseContainerElement';

const {
  graphService,
  graphSelection,
} = initializeOrGetServices();


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
    <BaseContainerElement
      className={'ContainerElement'}
      bounds={bounds}
      handlePointerDown={handlePointerDown}
      handleDragStart={handleDragStart}
      handleMoved={handleMoved}
      name={containerState.name}
      onRename={v => graphService.setContainerName(containerState.id, v)}
      selected={selected}
      setHeight={v => graphService.setContainerHeight(containerState.id, v)}
      setWidth={v => graphService.setContainerWidth(containerState.id, v)}
      setSize={v => graphService.setContainerSize(containerState.id, v.x, v.y)}
      zIndex={Object.keys(graphService.snapshot.containers).indexOf(containerState.id)}
      headerClassName={'ContainerHeader'}
      labelClassName={'ContainerEditableLabel'}
    />
  );
}

interface ContainerElementProps {
  containerState: ContainerState;
  zIndex: number;
  selected: boolean;
}
