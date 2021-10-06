import burger from './burger.svg';
import React, {useCallback, useRef, useState} from 'react';
import {consumeEvent, isEnterKeyEvent} from '../../../ui-utils/events';
import './ProjectBurgerMenu.css'
import useObservableState from '../../../ui-utils/UseObservableState';
import initializeOrGetServices from '../../../service/helpers/initialize-services';
import {pluck} from 'rxjs';
import OpenProjectWindow from '../OpenProjectWindow/OpenProjectWindow';
import {DEFAULT_PROJECT_NAME} from '../../../state/ProjectState';
import {getInitialGraphModel} from '../../../state/GraphState';

const DEFAULT_FILE_NAME = 'untitled-audio-graph';

const {
  projectService,
  jsonAdapterService,
  layoutService,
  graphSelection,
  graphService,
  historyService
} = initializeOrGetServices();

export default function ProjectBurgerMenu() {
  const projectName$ = projectService.state$.pipe(pluck('projectName'));
  const [projectName] = useObservableState(projectName$, '');
  const [isMenuVisible, setMenuVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackDropPointerDown = useCallback((evt: React.PointerEvent<HTMLDivElement>) => {
    setMenuVisible(false);
    consumeEvent(evt);
  }, [setMenuVisible]);

  const loadFromJson = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const downloadAsJson = useCallback(() => {
    const fileName = projectName || DEFAULT_FILE_NAME;
    downloadJsonFile(fileName, jsonAdapterService.getStateAsJsonString());
  }, [projectName]);

  const handleFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    const fileContent = evt.target.files?.[0];

    if (fileContent != null) {
      const reader = new FileReader();

      reader.onload = (evt) => {
        if (typeof evt.target?.result === 'string') {
          jsonAdapterService.loadFromJsonString(evt.target?.result);
        }
      };

      reader.readAsText(fileContent);
    }
  }, []);

  const loadFromJsonKeyHandler = (evt: React.KeyboardEvent<HTMLLIElement>) => {
    if (isEnterKeyEvent(evt)) {
      loadFromJson();
      consumeEvent(evt);
    }
  };

  const downloadAsJsonKeyHandler = useCallback((evt: React.KeyboardEvent<HTMLLIElement>) => {
    if (isEnterKeyEvent(evt)) {
      downloadAsJson();
      setMenuVisible(false);
      consumeEvent(evt);
    }
  }, [setMenuVisible, downloadAsJson]);

  const createNewProject = () => {
    projectService.setProjectName(DEFAULT_PROJECT_NAME);
    graphSelection.setSelection([]);
    graphService.loadState(getInitialGraphModel());
    historyService.setSavePoint();
  };

  const openProject = () => layoutService.showOpenProject();

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
          <li tabIndex={0}
              onPointerDown={createNewProject}
          >
            Create new project
          </li>
          <li tabIndex={0}
              onPointerDown={openProject}
          >
            Open project
          </li>
          <li tabIndex={0}
              onPointerDown={loadFromJson}
              onKeyDown={loadFromJsonKeyHandler}>Load from JSON
          </li>
          <li tabIndex={0}
              onPointerDown={downloadAsJson}
              onKeyDown={downloadAsJsonKeyHandler}>Download as JSON
          </li>
        </ul>
      </div>
      }
      <input
        type='file'
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileChange}
      />
      <OpenProjectWindow/>
    </div>);
}

function downloadJsonFile(fileName: string, fileContent: string) {
  const blob = new Blob([fileContent], {type: 'application/json'});
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
