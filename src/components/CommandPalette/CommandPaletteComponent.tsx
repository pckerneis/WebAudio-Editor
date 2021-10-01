import './CommandPaletteComponent.css';
import React, {useCallback, useMemo, useState} from 'react';

export default function CommandPaletteComponent(props: CommandPaletteComponentProps) {

  const commands: Command[] = useMemo(() => [
    {
      path: 'Create/Node/OscillatorNode',
      label: 'Create OscillatorNode',
      description: 'Creates an OscillatorNode'
    },
    {
      path: 'Create/Node/GainNode',
      label: 'Create GainNode',
      description: 'Creates an GainNode'
    },
    {
      path: 'Create/Node/DelayNode',
      label: 'Create DelayNode',
      description: 'Creates an DelayNode'
    },
  ], []);

  const [foundCommands, setFoundCommands] = useState<Command[]>(commands);
  const [filter, setFilter] = useState('');

  const handleInput = useCallback((evt) => {
    const text = evt.target.value ?? '';

    setFilter(text);

    const hasFilter = text.trim().length > 0;

    if (hasFilter) {
      const lowerCaseText = text.toLocaleLowerCase();
      setFoundCommands(commands.filter(cmd => cmd.path.toLocaleLowerCase().includes(lowerCaseText)
        || cmd.label.toLocaleLowerCase().includes(lowerCaseText)));
    } else {
      setFoundCommands(commands);
    }
  }, [commands, setFoundCommands]);

  const commandList = foundCommands.map(cmd => (
    <div key={cmd.path}
         className="CommandRow">
      {withBoldFilterMatch(cmd.label, filter, cmd.path)}
    </div>
  ));

  const hasFilter = filter.length > 0;

  return (
    <div className="CommandPalette dark-theme">
      <input
        className="FilterInput"
        placeholder="Type to find a command"
        onChange={handleInput}/>
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
  );
}

interface CommandPaletteComponentProps {
}

interface Command {
  label: string;
  path: string;
  description: string;
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
