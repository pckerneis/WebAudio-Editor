import React, {useCallback, useEffect, useRef, useState} from 'react';
import './MiniMap.css';
import {MiniMapNode, MiniMapState} from '../../state/MiniMapState';
import {GraphState} from '../../state/GraphState';
import Bounds, {expandBounds, getOuterBounds} from '../../model/Bounds';
import GraphService from '../../service/GraphService';

export default function MiniMap(props: MiniMapProps) {
  const {
    graphService,
    miniMapState,
  } = props;

  const {
    viewportBounds,
    nodes,
  } = miniMapState;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas != null) {
      const size = canvas.clientWidth ?? 0;
      canvas.width = size;
      canvas.height = size;

      const scaledElements = scaleToMiniMap(nodes,
        viewportBounds,
        canvas.width, canvas.height);

      render(canvas, scaledElements.scaledNodeBounds, scaledElements.scaledViewportBounds);
    }
  }, [canvasRef, nodes, viewportBounds]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, [setDragging]);

  const moveViewPortToPointer = useCallback((pointerX: number, pointerY: number) => {
    const canvas = canvasRef.current;

    if (canvas == null) {
      return;
    }

    const positionInMap = {
      x: pointerX - canvas.getBoundingClientRect().x,
      y: pointerY - canvas.getBoundingClientRect().y,
    };

    const {displayRatio, expandedBounds} = getScalingInfo(nodes, canvas.width, canvas.height);

    const realPosition = {
      x: positionInMap.x / displayRatio + expandedBounds.x,
      y: positionInMap.y / displayRatio + expandedBounds.y,
    };

    const newViewportOffset = {
      x: -realPosition.x + viewportBounds.width / 2,
      y: -realPosition.y + viewportBounds.height / 2,
    }

    graphService.setViewportTranslate(newViewportOffset);
  }, [graphService, nodes, viewportBounds.height, viewportBounds.width]);

  const handlePointerMove = useCallback((evt) => {
    if (! dragging) {
      return;
    }

    if (evt.pressure > 0) {
      moveViewPortToPointer(evt.clientX, evt.clientY);
    }
  }, [dragging, moveViewPortToPointer]);

  const handlePointerDown = useCallback((evt) => {
    setDragging(true);
    moveViewPortToPointer(evt.clientX, evt.clientY);
  }, [setDragging, moveViewPortToPointer]);

  return (
    <div className="MiniMap drop-shadow">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}

interface ScalingInfo {
  displayRatio: number;
  expandedBounds: Bounds;
}

function getScalingInfo(nodes: MiniMapNode[], miniMapWidth: number, miniMapHeight: number): ScalingInfo {
  const outerBounds = getOuterBounds(...nodes.map(n => n.bounds));
  const amountToExpand = Math.max(outerBounds.width, outerBounds.height) * 0.1;
  const expandedBounds = expandBounds(outerBounds, amountToExpand);
  const horizontalRatio = miniMapWidth / expandedBounds.width;
  const verticalRatio = miniMapHeight / expandedBounds.height;
  const displayRatio = Math.min(horizontalRatio, verticalRatio);
  return {
    displayRatio,
    expandedBounds,
  };
}

function scaleToMiniMap(nodes: MiniMapNode[],
                        viewportBounds: Bounds,
                        miniMapWidth: number,
                        miniMapHeight: number) {
  const {displayRatio, expandedBounds} = getScalingInfo(nodes, miniMapWidth, miniMapHeight);

  const scaledNodeBounds = nodes.map(n => {
    const x = (n.bounds.x - expandedBounds.x) * displayRatio;
    const y = (n.bounds.y - expandedBounds.y) * displayRatio;
    const width = Math.max(n.bounds.width * displayRatio, 2);
    const height = Math.max(n.bounds.height * displayRatio, 1);
    return {x, y, width, height}
  });

  const scaledViewportBounds = {
    x: (-viewportBounds.x - expandedBounds.x) * displayRatio,
    y: (-viewportBounds.y - expandedBounds.y) * displayRatio,
    width: viewportBounds.width * displayRatio,
    height: viewportBounds.height * displayRatio,
  };

  return {
    scaledNodeBounds,
    scaledViewportBounds,
  };
}

function render(canvas: HTMLCanvasElement,
                scaledNodeBounds: Bounds[],
                scaledViewportBounds: Bounds): void {
  const ctx = canvas.getContext('2d');

  if (ctx != null) {
    ctx.fillStyle = 'grey';

    scaledNodeBounds.forEach(n => {
      const {x, y, width, height} = n;
      ctx.fillRect(x, y, width, height);
    });

    ctx.strokeStyle = 'white';
    ctx.strokeRect(
      scaledViewportBounds.x,
      scaledViewportBounds.y,
      scaledViewportBounds.width,
      scaledViewportBounds.height);

    ctx.strokeStyle = '#ffffff'
    ctx.globalAlpha = 0.1;
    ctx.fillRect(
      scaledViewportBounds.x,
      scaledViewportBounds.y,
      scaledViewportBounds.width,
      scaledViewportBounds.height);
  }
}

interface MiniMapProps {
  miniMapState: MiniMapState;
  graphService: GraphService;
}

export function computeMiniMapState(graphState: GraphState): MiniMapState {
  return {
    nodes: Object.values(graphState.nodes).map(n => ({
      bounds: n.display.bounds,
      id: n.id,
    })),
    // TODO: use viewport bounds instead of window
    viewportBounds: {
      x: graphState.viewportOffset.x,
      y: graphState.viewportOffset.y,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  };
}
