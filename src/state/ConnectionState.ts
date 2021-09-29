import Identified from '../model/Identified';
import {PortId} from './PortState';

export interface ConnectionState extends Identified<string> {
  source: PortId;
  target: PortId;
}
