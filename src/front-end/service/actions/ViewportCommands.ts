import Coordinates from '../../../document/models/Coordinates';
import {GraphState} from '../../state/GraphState';

export function translateViewport(coordinates: Coordinates, state: GraphState): GraphState {
  return {
    ...state,
    viewportOffset: coordinates,
  };
}
