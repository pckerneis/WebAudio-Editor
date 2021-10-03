import {ReferencedPort} from '../../service/PortComponentRegistry';
import React, {createRef} from 'react';
import GraphService from '../../service/GraphService';
import {consumeEvent} from '../../ui-utils/events';

export function buildReferencedPorts(portIds: string[], service: GraphService): ReferencedPort[] {
  const handlePointerDown = (portId: string, evt: any) => {
    service.createTemporaryConnection(portId);
    consumeEvent(evt);
  };

  const handlePointerUp = (portId: string, evt: any) => {
    if (service.hasTemporaryConnection()) {
      service.applyTemporaryConnection(portId);
    }
    consumeEvent(evt);
  };

  return Array(portIds.length)
    .fill(0)
    .map((_, idx) => {
      const id = portIds[idx];
      const ref = createRef<HTMLDivElement>();
      const template = (
        <div key={idx}
             className="Port"
             ref={ref}
             onPointerDown={evt => handlePointerDown(id, evt)}
             onPointerUp={evt => handlePointerUp(id, evt)}>
        </div>
      );
      return {id, ref, template};
    });
}
