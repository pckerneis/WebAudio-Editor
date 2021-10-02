import './CommandPaletteComponent.css';
import React, {useCallback, useEffect, useState} from 'react';
import {consumeEvent} from '../../ui-utils/events';
import {Command} from '../../service/CommandService';
import initializeOrGetServices from '../../service/initialize-services';

const {commandService} = initializeOrGetServices();

export default function CommandPaletteComponent(props: {}): JSX.Element {
  const [
    isCommandPaletteVisible,
    setCommandPaletteVisible
  ] = useState(false);

  const [foundCommands, setFoundCommands] = useState<Command[]>(commandService.commands);

  const [filter, setFilter] = useState('');

  const handleInputChange = useCallback((evt) => {
    const text = evt.target.value.trim() ?? '';
    const hasFilter = text.trim().length > 0;

    setFilter(text);

    if (hasFilter) {
      const lowerCaseText = text.toLocaleLowerCase();
      setFoundCommands(commandService.commands
        .filter(cmd => cmd.path.toLocaleLowerCase().includes(lowerCaseText)
          || cmd.label.toLocaleLowerCase().includes(lowerCaseText)));
    } else {
      setFoundCommands(commandService.commands);
    }
  }, [setFoundCommands]);

  const resetAndClose = () => {
    setFoundCommands(commandService.commands);
    setCommandPaletteVisible(false);
  };

  useEffect(() => {
    const handleKeyPress = (evt: any) => {
      if (!isCommandPaletteVisible) {
        if (evt.code === 'Space') {
          if (foundCommands.length > 0) {
            setCommandPaletteVisible(true);
            consumeEvent(evt);
          }
        }

        return;
      }

      if (evt.code === 'Enter') {
        if (foundCommands.length > 0) {
          commandService.executeCommand(foundCommands[0].path);
          resetAndClose();
          consumeEvent(evt);
        }
      } else if (evt.code === 'Escape') {
        resetAndClose();
        consumeEvent(evt);
      }
    };

    document.addEventListener('keydown', handleKeyPress, false);

    return () => {
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  });

  const commandList = foundCommands.map(cmd => (
    <div key={cmd.path}
         className="CommandRow"
         onClick={evt => handleCommandRowClick(evt, cmd)}
    >
      {withBoldFilterMatch(cmd.label, filter, cmd.path)}
    </div>
  ));

  const hasFilter = filter.length > 0;

  const handleBackdropClick = (evt: any) => {
    resetAndClose();
    consumeEvent(evt);
  };

  const handleCommandRowClick = (evt: any, cmd: Command) => {
    commandService.executeCommand(cmd.path);
    resetAndClose();
    consumeEvent(evt);
  };

  return (
    isCommandPaletteVisible &&
    <div className="CommandPaletteBackdrop"
         onClick={handleBackdropClick}
    >
      <div className="CommandPalette dark-theme" onClick={consumeEvent}>
        <input
          className="FilterInput"
          placeholder="Type to find a command"
          onChange={handleInputChange}
          autoFocus={true}
        />
        {
          hasFilter && foundCommands.length === 0
          && noCommandsFound
        }
        {
          foundCommands.length > 0 &&
          <div className="CommandList">
            {commandList}
          </div>
        }
      </div>
    </div>
  ) as JSX.Element;
}

const noCommandsFound = (
  <span className="NoCommandsFound">
    No command found
  </span>
);

const withBoldFilterMatch = (text: string, filterValue: string, path: string) => {
  if (filterValue.length === 0) {
    return <span key={path}>{text}</span>;
  }

  const lcText = text.toLocaleLowerCase();
  const lcFilter = filterValue.toLocaleLowerCase();
  const tokens = lcText.split(lcFilter);

  let index = 0;
  const result: JSX.Element[] = [];

  tokens.forEach((token, i) => {
    if (token.length > 0) {
      result.push(<span key={path + '-' + index}>{text.slice(index, index + token.length)}</span>);
      index += token.length;
    }

    if (i < tokens.length - 1) {
      result.push(<b key={path + '-' + index}>{text.slice(index, index + filterValue.length)}</b>);
      index += filterValue.length;
    }
  });

  return result;
}
