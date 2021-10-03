import React from 'react';
import Coordinates from '../../document/models/Coordinates';
import {squaredDist} from '../utils/numbers';
import {rectangleCenter} from '../utils/geometry';
import {GraphState} from '../state/GraphState';
import {canConnect} from './actions/ConnectionCommands';

export interface ReferencedPort {
  id: string;
  ref: React.RefObject<HTMLDivElement>;
  template: JSX.Element;
  hidden?: boolean;
}

export class PortComponentRegistry {

  private _registeredPorts: ReferencedPort[] = [];

  getAllRegisteredPorts(): ReferencedPort[] {
    return [...this._registeredPorts];
  }

  registerPorts(...referencedPorts: ReferencedPort[]): void {
    const addedIds = referencedPorts.map(rp => rp.id);
    const untouched = this._registeredPorts.filter(rp => !addedIds.includes(rp.id));
    this._registeredPorts = [...untouched, ...referencedPorts];
  }

  findSuitablePort(mouseCoordinates: Coordinates, graphState: GraphState): ReferencedPort | null {
    if (graphState.temporaryConnectionPort == null) {
      return null;
    }

    const sourcePort = graphState.temporaryConnectionPort;
    const checkDistSquared = 225;

    return this.getAllRegisteredPorts()
      .filter(registeredPort => !registeredPort.hidden)
      .find(registeredPort => {
        const component = registeredPort.ref.current;

        if (component == null) {
          return false;
        }

        const portBounds = component.getBoundingClientRect();

        if (!canConnect(registeredPort.id, sourcePort.id, graphState)) {
          return false;
        }

        return squaredDist(rectangleCenter(portBounds), mouseCoordinates) < checkDistSquared;
      }) ?? null;
  }
}
