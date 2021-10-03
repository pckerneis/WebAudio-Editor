import './MenuBar.css';
import React, {ChangeEvent, useEffect, useState} from 'react';
import ProjectBurgerMenu from './ProjectMenu/ProjectBurgerMenu';
import PersistenceService from '../../service/PersistenceService';
import initializeOrGetServices from '../../service/initialize-services';
import right from './right.svg';

const {projectService, historyService} = initializeOrGetServices();

export default function MenuBar(props: MenuBarProps) {
  const {persistenceService} = props;
  const [projectName, setProjectName] = useState('');

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    projectService.setProjectName(evt.target.value.trim());
  };

  useEffect(() => {
    const sub = projectService.state$.subscribe(s => {
      setProjectName(s.projectName);
    });

     return () => {
       sub.unsubscribe();
     };
  });

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
        className={"UndoIcon" + (historyService.canUndo ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        alt="Undo"
      />
      <img
        className={'RedoIcon' + (historyService.canRedo ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        alt="Redo"
      />
    </div>
  );
}

interface MenuBarProps {
  persistenceService: PersistenceService;
}
