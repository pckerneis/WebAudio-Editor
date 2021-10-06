import React, {useRef, useState} from 'react';
import {consumeEvent, isEnterKeyEvent} from '../../ui-utils/events';
import './EditableLabel.css';

export default function EditableLabel(props: EditableLabelProps) {
  const {
    onChange,
    value,
    inputStyle,
    className,
    placeHolder,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [editable, setEditable] = useState(false);
  const [transientValue, setTransientValue] = useState(value);

  const handleDoubleClick = () => {
    setTransientValue(value);
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
      className="EditableLabel"
      ref={inputRef}
      value={transientValue}
      autoFocus
      onPointerDown={consumeEvent}
      onPointerUp={consumeEvent}
      onChange={(event) => setTransientValue(event.target.value)}
      onKeyDown={consumeEvent}
      onKeyUp={handleKeyUp}
      onBlur={sendValueAndClose}
      placeholder={placeHolder}
      style={({...inputStyle, width: '100%'})}/>
  ) : (
    <span className={`EditableLabelRead${value ? '' : ' placeholder'}`}
          style={({margin: '1px', textAlign: 'center'})}>
      {value || placeHolder}
    </span>
  );

  return (
    <div className={className}
         onDoubleClick={handleDoubleClick}
         style={({display: 'flex'})}>
      {content}
    </div>
  );
}

interface EditableLabelProps {
  onChange: Function,
  value: string,
  inputStyle?: React.CSSProperties;
  className?: string,
  placeHolder?: string,
}
