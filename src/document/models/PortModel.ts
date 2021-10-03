export enum PortKind {
  input = 'input',
  output = 'output',
  audioParam = 'audioParam',
}

export interface PortModel {
  id: string;
  kind: PortKind;
}

export function isPortKind(candidate: any): candidate is PortKind {
  return Object.values(PortKind).includes(candidate);
}

