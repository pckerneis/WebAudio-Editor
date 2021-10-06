import './MenuBar.css';
import React from 'react';
import ProjectMenu from './ProjectMenu/ProjectMenu';
import initializeOrGetServices from '../../service/helpers/initialize-services';
import right from './right.svg';
import floppy from './floppy.svg';
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
} = initializeOrGetServices();

export default function MenuBar() {
  const projectName$ = projectService.state$.pipe(pluck('projectName'))
  const [projectName] = useObservableState(projectName$, '');
  useObservableState(historyService.current$, null);
  const [playing] = useObservableState(playService.playing$, false);

  const handleUndo = () => historyService.undo();
  const handleRedo = () => historyService.redo();
  const handleChange = (value: string) => projectService.renameProject(value);

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

  const handleSave = () => {
    localeStorageService.saveProject();
    historyService.setSavePoint();
  };

  return (
    <div className="MenuBar drop-shadow">
      <ProjectMenu/>
      <EditableLabel
        className="ProjectNameInput"
        value={projectName}
        onChange={handleChange}
        placeHolder={PROJECT_NAME_PLACEHOLDER}
      />
      <img
        className={'IconButton SaveIcon' + (historyService.hasPrevious ? '' : ' disabled')}
        src={floppy}
        tabIndex={0}
        onPointerDown={handleSave}
        title="Save"
        alt="Save"
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
