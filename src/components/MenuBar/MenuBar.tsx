import './MenuBar.css';
import React, {ChangeEvent, useEffect, useState} from 'react';
import ProjectBurgerMenu from './ProjectMenu/ProjectBurgerMenu';
import PersistenceService from '../../service/PersistenceService';
import initializeOrGetServices from '../../service/initialize-services';

const {projectService} = initializeOrGetServices();

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
    </div>
  );
}

interface MenuBarProps {
  persistenceService: PersistenceService;
}
