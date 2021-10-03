import {ReferencedPort} from '../../service/PortComponentRegistry';
import React, {createRef} from 'react';
import GraphService from '../../service/GraphService';
import {PortId} from '../../state/PortState';
import {consumeEvent} from '../../ui-utils/events';

export function buildReferencedPorts(portIds: PortId[], service: GraphService): ReferencedPort[] {
  const handlePointerDown = (portId: PortId, evt: any) => {
    service.createTemporaryConnection(portId);
    consumeEvent(evt);
  };

  const handlePointerUp = (portId: PortId, evt: any) => {
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
