import {ReferencedPort} from '../../service/PortComponentRegistry';
import React, {createRef} from 'react';
import GraphService from '../../service/GraphService';
import {PortId} from '../../state/PortState';
import {consumeEvent} from '../../ui-utils/events';

export function buildReferencedPorts(portIds: PortId[], service: GraphService): ReferencedPort[] {
  const handleClick = (portId: PortId, evt: any) => {
    service.createOrApplyTemporaryConnection(portId);
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
             onClick={evt => handleClick(id, evt)}>
        </div>
      );
      return {id, ref, template};
    });
}
