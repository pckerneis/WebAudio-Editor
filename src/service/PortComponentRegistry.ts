import React from 'react';
import {PortId} from '../state/PortState';

export interface ReferencedPort {
  id: PortId;
  ref: React.RefObject<HTMLDivElement>;
  template: JSX.Element;
}

export interface PortComponentRegistry {
  registerPorts(...referencedPorts: ReferencedPort[]): void;
  getAllRegisteredPorts(): ReferencedPort[];
}
