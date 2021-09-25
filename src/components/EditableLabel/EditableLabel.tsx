import PropTypes from 'prop-types';
import React, {useState} from 'react';

export default function EditableLabel(props: any) {
  const {
    onChange,
    value
  } = props;

  const [editable, setEditable] = useState(false);
  const [transientValue, setTransientValue] = useState(value);

  const handleDoubleClick = () => {
    setEditable(true);
    console.log('editable');
  };

  const handleKeyUp = (event: any) => {
    if (event.key === 'Enter') {
      sendValueAndClose();
      event.stopPropagation();
    }
  };

  const sendValueAndClose = () => {
    onChange(transientValue);
    setEditable(false);
  };

  const content = editable ? (
    <input value={transientValue}
           autoFocus
           onPointerDown={evt => evt.stopPropagation()}
           onPointerUp={evt => evt.stopPropagation()}
           onChange={(event) => setTransientValue(event.target.value)}
           onKeyUp={handleKeyUp}
           onBlur={sendValueAndClose}
           style={({width: '100%'})}/>
  ) : (
    <span>{value}</span>
  );

  return (
    <div onDoubleClick={handleDoubleClick}
         style={({display: 'flex'})}>
      {content}
    </div>
  );
}

const {func, string} = PropTypes;

EditableLabel.propTypes = {
  onChange: func.isRequired,
  value: string.isRequired,
}
