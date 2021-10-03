import './MenuBar.css';
import React, {ChangeEvent, useState} from 'react';
import ProjectBurgerMenu from './ProjectMenu/ProjectBurgerMenu';
import PersistenceService from '../../service/PersistenceService';

export default function MenuBar(props: MenuBarProps) {
  const {persistenceService} = props;
  const [projectName, setProjectName] = useState('Untitled audio graph');

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    setProjectName(evt.target.value.trim());
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
    </div>
  );
}

interface MenuBarProps {
  persistenceService: PersistenceService;
}
