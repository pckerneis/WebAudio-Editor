import Identified from '../model/Identified';
import {NodeId} from './NodeState';

type ConnectionId = 'string';

export interface ConnectionState extends Identified<ConnectionId> {
  id: ConnectionId;
  source: NodeId;
  destination: NodeId;
}
