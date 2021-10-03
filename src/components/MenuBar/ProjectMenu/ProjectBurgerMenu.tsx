import burger from './burger.svg';
import React, {useCallback, useRef, useState} from 'react';
import {consumeEvent} from '../../../ui-utils/events';
import './ProjectBurgerMenu.css'
import PersistenceService from '../../../service/PersistenceService';

export default function ProjectBurgerMenu(props: ProjectBurgerMenuProps) {
  const {persistenceService, projectName} = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleBackDropPointerDown = useCallback((evt: React.PointerEvent<HTMLDivElement>) => {
    setMenuVisible(false);
    consumeEvent(evt);
  }, [setMenuVisible]);

  const loadFromJson = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const downloadAsJson = useCallback(() => {
    const blob = new Blob([persistenceService.getStateAsJsonString()],{type:'application/json'});
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = projectName + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [persistenceService, projectName]);

  const handleFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileContent = evt.target.files?.[0];

    if (fileContent != null) {
      const reader = new FileReader();

      reader.onload = (evt) => {
        if (typeof evt.target?.result === 'string') {
          persistenceService.loadFromJsonString(evt.target?.result);
        }
      };

      reader.readAsText(fileContent);
    }
  }, []);

  return (
    <div style={{width: 38}}>
      <img
        className="BurgerMenuIcon"
        src={burger}
        tabIndex={0}
        alt="Project menu"
        onPointerDown={() => setMenuVisible(true)}
      />
      {isMenuVisible &&
      <div className="ProjectMenuBackDrop"
           onPointerDown={handleBackDropPointerDown}
      >
        <ul className="drop-shadow">
          <li onPointerDown={loadFromJson}>Load from JSON</li>
          <li onPointerDown={downloadAsJson}>Download as JSON</li>
        </ul>
      </div>
      }
      <input
        type='file'
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileChange}
      />
    </div>);
}

interface ProjectBurgerMenuProps {
  projectName: string;
  persistenceService: PersistenceService;
}
