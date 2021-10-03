import Identified from './Identified';
import {PortId} from './PortState';

export type ConnectionId = string;

export interface ConnectionState extends Identified<ConnectionId> {
  source: PortId;
  target: PortId;
}
