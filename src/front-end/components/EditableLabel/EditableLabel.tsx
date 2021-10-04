import PropTypes from 'prop-types';
import React, {useRef, useState} from 'react';
import {consumeEvent, isEnterKeyEvent} from '../../ui-utils/events';
import './EditableLabel.css';

export default function EditableLabel(props: any) {
  const {
    onChange,
    value,
    style,
    className,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [editable, setEditable] = useState(false);
  const [transientValue, setTransientValue] = useState(value);

  const handleDoubleClick = () => {
    setEditable(true);
    setTimeout(() => inputRef.current?.select());
  };

  const handleKeyUp = (event: any) => {
    if (isEnterKeyEvent(event)) {
      sendValueAndClose();
      event.stopPropagation();
    }
  };

  const sendValueAndClose = () => {
    onChange(transientValue);
    setEditable(false);
  };

  const content = editable ? (
    <input
      ref={inputRef}
      value={transientValue}
      autoFocus
      onPointerDown={consumeEvent}
      onPointerUp={consumeEvent}
      onChange={(event) => setTransientValue(event.target.value)}
      onKeyDown={consumeEvent}
      onKeyUp={handleKeyUp}
      onBlur={sendValueAndClose}
      style={({...style, width: '100%'})}/>
  ) : (
    <span className="EditableLabelRead" style={({margin: '1px', textAlign: 'center'})}>{value}</span>
  );

  return (
    <div className={className}
         onDoubleClick={handleDoubleClick}
         style={({display: 'flex'})}>
      {content}
    </div>
  );
}

const {func, string, shape} = PropTypes;

EditableLabel.propTypes = {
  onChange: func.isRequired,
  value: string.isRequired,
  style: shape({}),
  className: string,
};
