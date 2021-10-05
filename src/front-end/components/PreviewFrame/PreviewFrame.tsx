import React, {useCallback, useState} from 'react';
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
  const [audioGraph, setAudioGraph] = useState<any>(null);

  const handleBackDropClicked = () => {
    stop();
    layoutService.closePreviewFrame();
  };

  const start = useCallback(() => {
    const projectDocument = persistenceService.getState();
    const buildResult = new WebAudioGraphBuilder().build(projectDocument);

    if (buildResult.error) {
      messageService.post(buildResult.error.message, 'error');
    } else {
      setAudioGraph(buildResult.audioGraph);
    }
  }, [setAudioGraph]);

  const stop = useCallback(() => {
    audioGraph?.context?.close();
    setAudioGraph(null);
  }, [audioGraph]);

  const handleButtonPress = useCallback(() => {
    if (audioGraph == null) {
      start();
    } else {
      stop();
    }
  }, [audioGraph, stop, start]);

  const buttonText = audioGraph ? 'Stop' : 'Start';

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
          onClick={handleButtonPress}
        >
          {buttonText}
        </button>
      </div>
    </div>);

  return layout.previewVisible ? element : <div>
  </div>
}
