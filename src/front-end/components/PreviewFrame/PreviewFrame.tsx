import React, {createRef, useEffect} from 'react';
import './PreviewFrame.css'
import {Preview} from './Preview';
import ReactDOMServer from 'react-dom/server'
import initializeOrGetServices from '../../service/helpers/initialize-services';
import WrapAsState from '../../ui-utils/WrapAsState';
import {emptyLayout} from '../../service/LayoutService';

const {layoutService} = initializeOrGetServices();

export default function PreviewFrame(): JSX.Element {
  const iframeRef = createRef<HTMLIFrameElement>();
  const [layout] = WrapAsState(layoutService.state$, emptyLayout());

  useEffect(() => {
    const iframe = iframeRef.current;

    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.document.open();
      const content = ReactDOMServer.renderToString(<Preview/>);
      iframe.contentWindow.document.write(content);
      iframe.contentWindow.document.close();
    }
  });

  const handleBackDropClicked = () => {
    layoutService.closePreviewFrame();
    console.log('clicked')
  }

  const element = (
    <div className="PreviewFrameBackDrop"
         onClick={handleBackDropClicked}
    >
      <iframe
        ref={iframeRef}
        title="preview-frame"
        className="drop-shadow">
      </iframe>
    </div>);

  return layout.previewVisible ? element : <div>
  </div>
}
