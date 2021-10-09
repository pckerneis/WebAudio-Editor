import Coordinates from '../../../document/models/Coordinates';
import {GraphState} from '../../state/GraphState';
import {ContainerState} from '../../state/ContainerState';
import Bounds from '../../../document/models/Bounds';
import {nextId} from '../../utils/IdentifierGenerator';

const MIN_WIDTH = 100;
const MIN_HEIGHT = 100;
export const DEFAULT_CONTAINER_WIDTH = 300;
export const DEFAULT_CONTAINER_HEIGHT = 300;

function nextContainerId(knownIds: string[]): string {
  return nextId('Container-', knownIds);
}

export function isContainerId(candidate: any): boolean {
  return typeof candidate === 'string'
    && candidate.split('-').length === 2
    && candidate.split('-')[0] === 'Container';
}

function extractAllContainerIds(graphState: GraphState): string[] {
  return Object.keys(graphState.containers);
}

export function createContainer(name: string,
                                bounds: Bounds,
                                graphState: GraphState): ContainerState {

  const id = nextContainerId(extractAllContainerIds(graphState));

  return {
    id,
    name,
    display: {
      bounds,
    },
  };
}

export function addContainer(container: ContainerState, graphState: GraphState): GraphState {
  return {
    ...graphState,
    containers: {
      ...graphState.containers,
      [container.id]: container,
    }
  };
}

export function setContainerPosition(id: string, coordinates: Coordinates, state: GraphState): GraphState {
  return transformExistingContainer(id, state, (n) => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        ...coordinates,
      }
    }
  }));
}

export function setContainerWidth(id: string, width: number, state: GraphState): GraphState {
  return transformExistingContainer(id, state, (n) => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        width: Math.max(width, MIN_WIDTH),
      }
    }
  }));
}

export function setContainerHeight(id: string, height: number, state: GraphState): GraphState {
  return transformExistingContainer(id, state, (n) => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        height: Math.max(height, MIN_HEIGHT),
      }
    }
  }));
}

export function setContainerSize(id: string, width: number, height: number, state: GraphState): GraphState {
  return transformExistingContainer(id, state, (n) => ({
    ...n,
    display: {
      ...n.display,
      bounds: {
        ...n.display.bounds,
        width: Math.max(width, MIN_WIDTH),
        height: Math.max(height, MIN_HEIGHT),
      }
    }
  }));
}

export function setContainerName(id: string, name: string, state: GraphState): GraphState {
  return transformExistingContainer(id, state, (n) => ({
    ...n,
    name,
  }));
}

export function transformExistingContainer(id: string,
                                           state: GraphState,
                                           mapper: (n: ContainerState) => ContainerState): GraphState {
  // assertNodeExists(id, state);

  return {
    ...state,
    containers: {
      ...state.containers,
      [id]: mapper(state.containers[id]),
    },
  };
}
