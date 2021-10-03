import React, {createRef} from 'react';
import './ParamPanel.css'
import PropTypes from 'prop-types';
import {consumeEvent} from '../../ui-utils/events';
import {ParamDefinition, ParamType} from '../../../document/node-definitions/NodeDefinition';
import {ParamPorts, ParamValues} from '../../../document/models/NodeModel';
import initializeOrGetServices from '../../service/initialize-services';

const {graphService, portRegistry, graphSelection} = initializeOrGetServices();

interface ParamPanelProps {
  nodeId: string;
  paramValues: ParamValues;
  paramPorts: ParamPorts;
  paramDefinitions: ParamDefinition[];
}

function ParamPanel(props: ParamPanelProps) {
  const {
    nodeId,
    paramValues,
    paramPorts,
    paramDefinitions,
  } = props;

  const handleInputPointerDown = (evt: any) => {
    consumeEvent(evt);
    graphService.sendNodeToFront(nodeId);

    if (!graphSelection.isSelected(nodeId)) {
      graphSelection.setUniqueSelection(nodeId);
    }
  };

  const paramElements = paramDefinitions
    .map(definition => {
        const paramName = definition.name;
        const currentValue = paramValues[paramName];

        const handleInputChange = (evt: any) => {
          const value = evt.target.value;
          graphService.setParamValue(nodeId, paramName, value);
        };

        const isChoiceParam = definition.type === ParamType.choice;

        const options = isChoiceParam ? definition.possibleValues.map(value => {
          return (<option key={value} value={value}>{value}</option>);
        }) : [];

        let inputElement: JSX.Element;

        switch (definition.type) {
          case ParamType.choice:
            inputElement = <select
              key={paramName + '_select'}
              value={currentValue}
              onChange={handleInputChange}
              onPointerDown={handleInputPointerDown}
            >
              {options}
            </select>;
            break;
          case ParamType.AudioParam:
            inputElement = <input
              key={paramName + '_input'}
              type="number"
              value={currentValue}
              min={definition.min}
              max={definition.max}
              onChange={handleInputChange}
              onPointerDown={handleInputPointerDown}
            />;
            break;
          case ParamType.boolean:
            inputElement = <input
              key={paramName + '_input'}
              type="checkbox"
              value={currentValue}
              onChange={handleInputChange}
              onPointerDown={handleInputPointerDown}
            />;
            break;
          case ParamType.number:
            inputElement = <input
              key={paramName + '_input'}
              type="number"
              value={currentValue}
              min={definition?.min}
              max={definition?.max}
              onChange={handleInputChange}
              onPointerDown={handleInputPointerDown}
            />;
            break;
          default:
            inputElement = <span>
            </span>;
        }

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
                 onPointerDown={evt => handlePointerDown(evt)}>
            </div>),
        } : null;

        if (port != null) {
          portRegistry.registerPorts(port);
        }

        const handlePointerDown = (evt: any) => {
          if (port) {
            graphService.createTemporaryConnection(port.id);
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
  nodeId: string.isRequired,
}

export default React.memo(ParamPanel);
