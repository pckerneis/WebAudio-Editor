import React, {useCallback} from 'react';
import './PreviewFrame.css'
import initializeOrGetServices from '../../service/helpers/initialize-services';
import WrapAsState from '../../ui-utils/WrapAsState';
import {emptyLayout} from '../../service/LayoutService';
import {consumeEvent} from '../../ui-utils/events';
import {WebAudioGraphBuilder} from '../../../builder/WebAudioGraphBuilder';

const {
  layoutService,
  persistenceService,
  messageService,
} = initializeOrGetServices();

export default function PreviewFrame(): JSX.Element {
  const [layout] = WrapAsState(layoutService.state$, emptyLayout());

  const handleBackDropClicked = () => {
    layoutService.closePreviewFrame();
  };

  const handleStart = useCallback(() => {
    const projectDocument = persistenceService.getState();
    const buildResult = new WebAudioGraphBuilder().build(projectDocument);

    if (buildResult.error) {
      messageService.post(buildResult.error.message, 'error');
    } else {
      console.log(buildResult.audioGraph);
    }
  }, []);


  const element = (
    <div
      className="PreviewFrameBackDrop"
      onClick={handleBackDropClicked}
    >
      <div
        className="drop-shadow"
        onClick={consumeEvent}
      >
        <button
          onClick={handleStart}
        >
          Start
        </button>
      </div>
    </div>);

  return layout.previewVisible ? element : <div>
  </div>
}
