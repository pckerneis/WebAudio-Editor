import {PortId} from './NodeState';
import Identified from '../model/Identified';

export interface ConnectionState extends Identified<string> {
  source: PortId;
  target: PortId;
}
