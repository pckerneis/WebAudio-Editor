import './MenuBar.css';
import React, {ChangeEvent} from 'react';
import ProjectBurgerMenu from './ProjectMenu/ProjectBurgerMenu';
import initializeOrGetServices from '../../service/initialize-services';
import right from './right.svg';
import {pluck} from 'rxjs';
import WrapAsState from '../../ui-utils/WrapAsState';

const {projectService, historyService} = initializeOrGetServices();

export default function MenuBar() {
  const projectName$ = projectService.state$.pipe(pluck('projectName'))
  const [projectName] = WrapAsState(projectName$, '');
  WrapAsState(historyService.current$, null);

  const handleUndo = () => historyService.undo();
  const handleRedo = () => historyService.redo();
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    projectService.setProjectName(evt.target.value.trim());
  };

  return (
    <div className="MenuBar drop-shadow">
      <ProjectBurgerMenu/>
      <input className="ProjectNameInput"
             value={projectName}
             onChange={handleChange}
      />
      <img
        className={'UndoIcon' + (historyService.hasPrevious ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        onPointerDown={handleUndo}
        title={historyService.undoDescription ?? ''}
        alt="Undo"
      />
      <img
        className={'RedoIcon' + (historyService.hasNext ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        onPointerDown={handleRedo}
        title={historyService.redoDescription ?? ''}
        alt="Redo"
      />
    </div>
  );
}
