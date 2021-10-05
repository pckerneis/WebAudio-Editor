import React, {useCallback} from 'react';
import {ModalWindow} from '../../ModalWindow/ModalWindow';
import {consumeEvent} from '../../../ui-utils/events';
import './OpenProjectWindow.css';
import initializeOrGetServices from '../../../service/helpers/initialize-services';
import {ProjectInfo} from '../../../service/LocaleStorageService';
import useObservableState from '../../../ui-utils/UseObservableState';

const {
  localeStorageService,
  layoutService,
} = initializeOrGetServices();

export default function OpenProjectWindow() {
  const [isProjectWindowVisible] = useObservableState(layoutService.isOpenProjectVisible$, false);

  const handleProjectRowClicked = useCallback((info: ProjectInfo) => {
    localeStorageService.loadProject(info)
    layoutService.closeOpenProject();
  }, []);

  const projectRows = localeStorageService.getKnownProjectInfos().map(info => {
    const date = info.lastModification.toLocaleDateString();
    const time = info.lastModification.toLocaleTimeString();
    return (
      <div className="OpenProjectWindowRow"
           key={info.projectName}
           onClick={() => handleProjectRowClicked(info)}
      >
        <span>{info.projectName}</span>
        <span>{date}, {time}</span>
      </div>
    );
  });

  return (
    <ModalWindow
      visible={isProjectWindowVisible}
      close={() => layoutService.closeOpenProject()}
    >
      <div className="OpenProjectWindow drop-shadow"
           onClick={consumeEvent}
      >
        <span>Open project</span>
        <div className="OpenProjectWindowHeader">
          <span>Project name</span>
          <span>Last modified</span>
        </div>
        <div className="ProjectList">
          {projectRows}
        </div>
      </div>
    </ModalWindow>
  )
}
