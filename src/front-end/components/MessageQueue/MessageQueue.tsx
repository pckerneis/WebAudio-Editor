import React, {useCallback} from 'react';
import './MessageQueue.css';
import {consumeEvent} from '../../ui-utils/events';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import {Message} from '../../service/MessageService';
import WrapAsState from '../../ui-utils/WrapAsState';

const {messageService} = initializeOrGetServices();

export default function MessageQueue() {
  const [messages] = WrapAsState(messageService.messages$, []);

  const handleCloseClick = useCallback((msg: Message, evt: any) => {
    messageService.close(msg.id);
    consumeEvent(evt);
  }, []);

  const messageElements = () => messages.map((msg: any, idx) => {
    return <div key={idx} className="MessageBox drop-shadow">
      <span className={msg.level}>{msg.text}</span>
      <button onClick={(evt) => handleCloseClick(msg, evt)}>x</button>
    </div>;
  });

  return (
    <div className="MessageQueue">
      {messageElements()}
    </div>
  );
}
