import React, {createRef} from 'react';
import './ParamPanel.css'
import PropTypes from 'prop-types';
import {ParamDefinition, ParamType} from '../../model/NodeDefinition.model';
import {NodeId, ParamPorts, ParamValues} from '../../state/NodeState';
import GraphService from '../../service/GraphService';
import {consumeEvent} from '../../ui-utils/events';
import {PortComponentRegistry} from '../../service/PortComponentRegistry';
import SelectedItemSet from '../../utils/SelectedItemSet';

interface ParamPanelProps {
  nodeId: NodeId;
  paramValues: ParamValues;
  paramPorts: ParamPorts;
  paramDefinitions: ParamDefinition[];
  service: GraphService;
  portRegistry: PortComponentRegistry;
  graphSelection: SelectedItemSet<string>;
}

function ParamPanel(props: ParamPanelProps) {
  const {
    nodeId,
    paramValues,
    paramPorts,
    paramDefinitions,
    service,
    portRegistry,
    graphSelection,
  } = props;

  const handleInputPointerDown = (evt: any) => {
    consumeEvent(evt);
    service.sendNodeToFront(nodeId);

    if (! graphSelection.isSelected(nodeId)) {
      graphSelection.setUniqueSelection(nodeId);
    }
  };

  const paramElements = paramDefinitions
    .map(definition => {
        const paramName = definition.name;
        const currentValue = paramValues[paramName];

        const handleInputChange = (evt: any) => {
          const value = evt.target.value;
          service.setParamValue(nodeId, paramName, value);
        };

        const isChoiceParam = definition.type === ParamType.choice;

        const options = isChoiceParam ? definition.possibleValues.map(value => {
          return (<option key={value} value={value}>{value}</option>);
        }) : [];

        const inputElement = isChoiceParam ?
          <select
            key={paramName + '_select'}
            value={currentValue}
            onChange={handleInputChange}
            onPointerDown={handleInputPointerDown}
          >
            {options}
          </select>
          : <input
            key={paramName + '_input'}
            type="number"
            value={currentValue}
            min={definition.min}
            max={definition.max}
            onChange={handleInputChange}
            onPointerDown={handleInputPointerDown}
          />;

        const acceptsInput = definition.type === ParamType.AudioParam
          && definition.acceptsInput;

        const portRef = createRef<HTMLDivElement>();

        const port = acceptsInput ? {
          id: paramPorts[paramName].id,
          ref: portRef,
          template: (
            <div key={paramName + '_port'}
                 className="ParamPort"
                 ref={portRef}
                 onClick={evt => handlePortClick(evt)}>
            </div>),
        } : null;

        if (port != null) {
          portRegistry.registerPorts(port);
        }

        const handlePortClick = (evt: any) => {
          if (port) {
            service.createOrApplyTemporaryConnection(port.id);
          }

          consumeEvent(evt);
        };

        return ([
          <div className="ParamKey" key={paramName + '_label'}>
            {acceptsInput && port?.template}
            {
              definition.name
            }
          </div>,
          inputElement,
        ]);
      }
    );

  return (
    <div className="ParamPanel">
      {paramElements}
    </div>
  );
}

const {shape, array, string} = PropTypes;

ParamPanel.propTypes = {
  paramValues: shape({}).isRequired,
  paramPorts: shape({}).isRequired,
  paramDefinitions: array.isRequired,
  portRegistry: shape({}).isRequired,
  graphSelection: shape({}).isRequired,
  nodeId: string.isRequired,
  service: shape({}).isRequired,
}

export default React.memo(ParamPanel);
