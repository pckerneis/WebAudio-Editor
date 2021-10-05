import React, {useCallback} from 'react';
import {consumeEvent} from '../../ui-utils/events';
import './ModalWindow.css';

export function ModalWindow(props: ModalWindowProps) {
  const {
    visible,
    close,
    style,
  } = props;

  const handleClick = useCallback((evt) => {
    close();
    consumeEvent(evt);
  }, [close]);

  return visible ? (
    <div
      className="ModalBackground"
      onClick={handleClick}
      style={style}
    >
      {props.children}
    </div>
  ): null;
}

interface ModalWindowProps {
  visible: boolean;
  close: () => void;
  children?: any;
  style?: any;
}
