import PropTypes from 'prop-types';
import React from 'react';
import './ParamPanel.css'
import {ParamDefinition} from '../../model/NodeDefinition.model';

export default function ParamPanel(props: any) {
  const {
    paramValues,
    paramDefinitions,
    style,
  } = props as {
    paramValues: { [id: string]: any },
    paramDefinitions: ParamDefinition[],
    style: any,
  };

  const paramElements = paramDefinitions
    .map(definition => {
      return (<div className="ParamRow" key={definition.name}>
        <span className="ParamKey">{definition.name}</span>
        <span className="ParamValue">{paramValues[definition.name]}</span>
      </div>);
    }
  );

  return (
    <div className="ParamPanel" style={style}>
      {paramElements}
    </div>
  );
}

const {shape, array} = PropTypes;

ParamPanel.propTypes = {
  paramValues: shape({}).isRequired,
  paramDefinitions: array.isRequired,
  style: shape({}),
}
