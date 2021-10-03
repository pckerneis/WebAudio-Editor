import Identified from './Identified';

export type PortId = string;

export enum PortKind {
  input = 'input',
  output = 'output',
  audioParam = 'audioParam',
}

export interface PortState extends Identified<PortId> {
  kind: PortKind;
}

export function isPortKind(candidate: any): candidate is PortKind {
  return Object.values(PortKind).includes(candidate);
}
