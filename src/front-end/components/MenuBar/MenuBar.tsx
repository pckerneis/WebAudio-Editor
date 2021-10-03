import './MenuBar.css';
import React, {ChangeEvent} from 'react';
import ProjectBurgerMenu from './ProjectMenu/ProjectBurgerMenu';
import PersistenceService from '../../service/PersistenceService';
import initializeOrGetServices from '../../service/initialize-services';
import right from './right.svg';
import {pluck} from 'rxjs';
import WrapAsState from '../../ui-utils/WrapAsState';
import {emptyHistory} from '../../service/HistoryService';

const {projectService, historyService} = initializeOrGetServices();

export default function MenuBar(props: MenuBarProps) {
  const {persistenceService} = props;
  const projectName$ = projectService.state$.pipe(pluck('projectName'))
  const [projectName] = WrapAsState(projectName$, '');
  WrapAsState(historyService.state$, emptyHistory());

  const handleUndo = () => historyService.undo();
  const handleRedo = () => historyService.redo();
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    projectService.setProjectName(evt.target.value.trim());
  };

  return (
    <div className="MenuBar drop-shadow">
      <ProjectBurgerMenu
        projectName={projectName}
        persistenceService={persistenceService}
      />
      <input className="ProjectNameInput"
             value={projectName}
             onChange={handleChange}
      />
      <img
        className={'UndoIcon' + (historyService.canUndo ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        onPointerDown={handleUndo}
        alt="Undo"
      />
      <img
        className={'RedoIcon' + (historyService.canRedo ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        onPointerDown={handleRedo}
        alt="Redo"
      />
    </div>
  );
}

interface MenuBarProps {
  persistenceService: PersistenceService;
}
