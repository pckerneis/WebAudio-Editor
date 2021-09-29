import Identified from './Identified';

export type PortId = string;

export enum PortKind {
  INPUT,
  OUTPUT,
  AUDIO_PARAM,
}

export interface PortState extends Identified<PortId> {
  kind: PortKind;
}
