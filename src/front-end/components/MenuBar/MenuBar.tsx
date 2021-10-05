import './MenuBar.css';
import React, {ChangeEvent} from 'react';
import ProjectBurgerMenu from './ProjectMenu/ProjectBurgerMenu';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import right from './right.svg';
import play from './play.svg';
import stop from './stop.svg';
import {pluck} from 'rxjs';
import WrapAsState from '../../ui-utils/WrapAsState';
import {consumeEvent} from '../../ui-utils/events';

const PROJECT_NAME_PLACEHOLDER = 'Untitled audio graph';

const {projectService, historyService, playService} = initializeOrGetServices();

export default function MenuBar() {
  const projectName$ = projectService.state$.pipe(pluck('projectName'))
  const [projectName] = WrapAsState(projectName$, '');
  WrapAsState(historyService.current$, null);
  const [playing] = WrapAsState(playService.playing$, false);

  const handleUndo = () => historyService.undo();
  const handleRedo = () => historyService.redo();
  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    projectService.setProjectName(evt.target.value.trim());
  };
  const handlePlay = (evt: any) => {
    if (playing) {
      playService.stop();
    } else {
      playService.start();
    }
    consumeEvent(evt);
  };

  const playButton = (
    <img
      className="PlayIcon IconButton"
      alt={playing ? "Stop" : "Play"}
      src={playing ? stop : play}
      onClick={handlePlay}
    />
    );

  return (
    <div className="MenuBar drop-shadow">
      <ProjectBurgerMenu/>
      <input className="ProjectNameInput"
             value={projectName}
             onChange={handleChange}
             placeholder={PROJECT_NAME_PLACEHOLDER}
      />
      <div className="MenuBarSeparator">
      </div>
      <img
        className={'IconButton UndoIcon' + (historyService.hasPrevious ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        onPointerDown={handleUndo}
        title={historyService.undoDescription ?? ''}
        alt="Undo"
      />
      <img
        className={'IconButton RedoIcon' + (historyService.hasNext ? '' : ' disabled')}
        src={right}
        tabIndex={0}
        onPointerDown={handleRedo}
        title={historyService.redoDescription ?? ''}
        alt="Redo"
      />
      <div className="MenuBarSeparator">
      </div>
      {playButton}
    </div>
  );
}
