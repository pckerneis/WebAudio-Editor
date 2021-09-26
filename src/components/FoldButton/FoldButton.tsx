import PropTypes from 'prop-types';
import React from 'react';
import './FoldButton.css';
import {consumeEvent} from '../../ui-utils/events';

export default function FoldButton(props: any) {
  const {
    style,
    folded,
    onButtonClick
  } = props;

  const buttonText = folded ? '►' : '▼';

  return (
    <button
      style={style}
      className="FoldButton"
      onClick={onButtonClick}
      onPointerDown={consumeEvent}
    >
      {buttonText}
    </button>
  );
}

const {bool, func, shape} = PropTypes;

FoldButton.propTypes = {
  folded: bool.isRequired,
  onButtonClick: func.isRequired,
  style: shape({}),
}
