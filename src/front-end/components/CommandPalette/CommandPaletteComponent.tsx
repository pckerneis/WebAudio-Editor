import './CommandPaletteComponent.css';
import React, {useCallback, useEffect, useState} from 'react';
import {consumeEvent, isEnterKeyEvent, isEscapeKeyEvent} from '../../ui-utils/events';
import {RegisteredCommand} from '../../service/CommandService';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import {ModalWindow} from '../ModalWindow/ModalWindow';
import useObservableState from '../../ui-utils/UseObservableState';

const {
  commandService,
  layoutService,
} = initializeOrGetServices();

export default function CommandPaletteComponent(): JSX.Element {
  const [isCommandPaletteVisible] = useObservableState(layoutService.isCommandPaletteVisible$, false);
  const [hasModalWindow] = useObservableState(layoutService.hasModalWindow$, false);

  const commands = commandService.registeredCommands;

  const [foundCommands, setFoundCommands] = useState<string[]>(commands.map(cmd => cmd.path));

  const [filter, setFilter] = useState('');

  const handleInputChange = useCallback((evt) => {
    const text = evt.target.value.trim() ?? '';
    const hasFilter = text.trim().length > 0;

    setFilter(text);

    if (hasFilter) {
      const lowerCaseText = text.toLocaleLowerCase();
      setFoundCommands(commands
        .filter(cmd => cmd.path.toLocaleLowerCase().includes(lowerCaseText)
          || cmd.label.toLocaleLowerCase().includes(lowerCaseText))
        .map(cmd => cmd.path));
    } else {
      setFoundCommands(commands.map(cmd => cmd.path));
    }
  }, [setFoundCommands, commands]);

  const resetAndClose = () => {
    setFoundCommands(commands.map(cmd => cmd.path));
    layoutService.closeCommandPalette();
  };

  useEffect(() => {
    const handleKeyDown = (evt: any) => {
      if (!hasModalWindow && evt.code === 'Space' && foundCommands.length > 0) {
        layoutService.showCommandPalette();
        consumeEvent(evt);
      }

      if (! isCommandPaletteVisible) {
        return;
      }

      if (isEnterKeyEvent(evt)) {
        if (foundCommands.length > 0) {
          commandService.executeCommand(foundCommands[0]);
          resetAndClose();
          consumeEvent(evt);
        }
      } else if (isEscapeKeyEvent(evt)) {
        resetAndClose();
        consumeEvent(evt);
      }
    };

    document.addEventListener('keydown', handleKeyDown, false);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  });

  const commandList = foundCommands.map(cmdPath => {
    const cmd = commands.find(cmd => cmd.path === cmdPath);

    if (cmd == null) {
      return undefined;
    }

    const shortcutSet = cmd.keyboardShortcuts;

    const keyShortcuts = shortcutSet && shortcutSet.map((shortcut, idx) => {
      return [
        shortcut.map((key, keyIdx) => [
          <span key={idx + '-' + keyIdx} className="KeyCode">{key}</span>,
          keyIdx < shortcut.length - 1 && (<span key={idx + '-' + keyIdx + 'plus'}>+</span>)
        ]),
        idx < shortcutSet.length - 1 && (<span key={idx + 'slash'} className="ShortcutSeparator">/</span>),
      ];
    });

    const handleKeyPress = (evt: React.KeyboardEvent<HTMLDivElement>) => {
      if (isEnterKeyEvent(evt)) {
        handleCommandRowClick(evt, cmd);
      }
    };

    return (
      <div key={cmd.path}
           className={'CommandRow' + (cmd.disabled ? ' disabled' : '')}
           onClick={evt => handleCommandRowClick(evt, cmd)}
           onKeyDown={handleKeyPress}
           tabIndex={0}
      >
        {withBoldFilterMatch(cmd.label, filter, cmd.path)}
        <div className="KeyShortcuts">
          {keyShortcuts}
        </div>
      </div>
    )
  });

  const hasFilter = filter.length > 0;

  const handleCommandRowClick = (evt: any, cmd: RegisteredCommand) => {
    if (!cmd.disabled) {
      commandService.executeCommand(cmd.path);
      resetAndClose();
    }
    consumeEvent(evt);
  };

  return (
    <ModalWindow
      visible={isCommandPaletteVisible}
      close={resetAndClose}
    >
      <div className="CommandPalette drop-shadow" onClick={consumeEvent}>
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
    </ModalWindow>
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
