import React from 'react';
import {PortId} from '../state/NodeState';

export interface ReferencedPort {
  id: PortId;
  ref: React.RefObject<HTMLDivElement>;
  template: JSX.Element;
}

export interface PortRegistry {
  registerPorts(...referencedPorts: ReferencedPort[]): void;
  getAllRegisteredPorts(): ReferencedPort[];
}
