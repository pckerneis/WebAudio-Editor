import './MenuBar.css';
import React from 'react';
import ProjectBurgerMenu from './ProjectMenu/ProjectBurgerMenu';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import right from './right.svg';
import play from './play.svg';
import stop from './stop.svg';
import {pluck} from 'rxjs';
import useObservableState from '../../ui-utils/UseObservableState';
import {consumeEvent} from '../../ui-utils/events';
import EditableLabel from '../EditableLabel/EditableLabel';

const PROJECT_NAME_PLACEHOLDER = 'Untitled audio graph';

const {
  projectService,
  historyService,
  playService,
  localeStorageService,
  messageService
} = initializeOrGetServices();

export default function MenuBar() {
  const projectName$ = projectService.state$.pipe(pluck('projectName'))
  const [projectName] = useObservableState(projectName$, '');
  useObservableState(historyService.current$, null);
  const [playing] = useObservableState(playService.playing$, false);

  const handleUndo = () => historyService.undo();
  const handleRedo = () => historyService.redo();
  const handleChange = (value: string) => {
    try {
      localeStorageService.renameProject(value);
    } catch (e: any) {
      if (e.message) {
        messageService.post(e.message, 'error');
      }
    }
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
      alt={playing ? 'Stop' : 'Play'}
      src={playing ? stop : play}
      onClick={handlePlay}
    />
  );

  return (
    <div className="MenuBar drop-shadow">
      <ProjectBurgerMenu/>
      <EditableLabel
        className="ProjectNameInput"
        value={projectName}
        onChange={handleChange}
        placeHolder={PROJECT_NAME_PLACEHOLDER}
        inputStyle={{fontSize: 18}}
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
