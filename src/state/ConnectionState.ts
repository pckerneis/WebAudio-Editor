import {PortId} from './NodeState';

export interface ConnectionState {
  source: PortId;
  target: PortId;
}
