import PropTypes from 'prop-types';
import React from 'react';
import './ParamPanel.css'
import {ParamDefinition, ParamType} from '../../model/NodeDefinition.model';
import {NodeId} from '../../state/NodeState';
import GraphService from '../../service/GraphService';

interface ParamPanelProps {
  nodeId: NodeId;
  paramValues: { [id: string]: any };
  paramDefinitions: ParamDefinition[];
  service: GraphService;
  style: any;
}

export default function ParamPanel(props: ParamPanelProps) {
  const {
    nodeId,
    paramValues,
    paramDefinitions,
    service,
    style,
  } = props;

  const paramElements = paramDefinitions
    .map(definition => {
        const isChoiceParam = definition.type === ParamType.choice;

        const options = isChoiceParam ? definition.possibleValues.map(value => {
          return (<option key={value} value={value}>{value}</option>);
        }) : [];

        const currentValue = paramValues[definition.name];

        const handleInputChange = (evt: any) => {
          const value = evt.target.value;
          service.setParamValue(nodeId, definition.name, value);
        };

        const inputElement = isChoiceParam ?
          <select key={definition.name + '_select'} value={currentValue}
                  onChange={handleInputChange}>
            {options}
          </select>
          : <input key={definition.name + '_input'}
                   type="number"
                   value={currentValue}
                   min={definition.min}
                   max={definition.max}
                   onChange={handleInputChange}/>;

        return ([
          <span className="ParamKey" key={definition.name + '_label'}>{definition.name}</span>,
          inputElement,
        ]);
      }
    );

  return (
    <div className="ParamPanel" style={style}>
      {paramElements}
    </div>
  );
}

const {shape, array, string} = PropTypes;

ParamPanel.propTypes = {
  paramValues: shape({}).isRequired,
  paramDefinitions: array.isRequired,
  nodeId: string.isRequired,
  service: shape({}).isRequired,
  style: shape({}),
}
