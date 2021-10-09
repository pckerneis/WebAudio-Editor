import Bounds from '../../document/models/Bounds';

export interface ContainerState {
  id: string;
  name: string;
  display: {
    bounds: Bounds;
  }
}
