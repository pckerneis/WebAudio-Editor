import GraphComponent from '../Graph/GraphComponent';
import CommandPaletteComponent from '../CommandPalette/CommandPaletteComponent';
import React, {useCallback, useState} from 'react';
import initializeOrGetServices from '../../service/initialize-services';

const {commandService} = initializeOrGetServices();

export function App() {
  const [isCommandPaletteVisible, setCommandPaletteVisible] = useState(false);

  const handleKeyUp = useCallback((evt) => {
    if (evt.code === 'Space') {
      if (!isCommandPaletteVisible) {
        setCommandPaletteVisible(true);
      }
    }
  }, [isCommandPaletteVisible, setCommandPaletteVisible]);

  return (
    <div onKeyUp={handleKeyUp} tabIndex={-1}>
      <GraphComponent/>
      <CommandPaletteComponent
        commandService={commandService}
      />
    </div>
  );
}
