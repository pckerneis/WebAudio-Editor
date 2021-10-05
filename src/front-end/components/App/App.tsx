import GraphComponent from '../Graph/GraphComponent';
import CommandPaletteComponent from '../CommandPalette/CommandPaletteComponent';
import React, {useCallback, useState} from 'react';
import MenuBar from '../MenuBar/MenuBar';
import MessageQueue from '../MessageQueue/MessageQueue';

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
    <div id="theme-holder"
         className="dark-theme"
         onKeyUp={handleKeyUp}
         tabIndex={-1}>
      <GraphComponent/>
      <MenuBar/>
      <CommandPaletteComponent/>
      <MessageQueue/>
    </div>
  );
}
