import Coordinates from '../../../document/models/Coordinates';
import {Layout} from '../LayoutService';

export function translateViewport(coordinates: Coordinates, state: Layout): Layout {
  return {
    ...state,
    viewportOffset: coordinates,
  };
}
