import React, {useLayoutEffect, useState} from 'react';
import './App.css';
import DragToMove from './ui-utils/DragToMove';
import GraphService from './service/GraphService';
import {getInitialGraphModel, NodeKind, NodeModel} from './model/Graph.model';
import Node from './Node';

const graphServiceKey: any = 'c12d6-6s5df4-fdkslf';

if (window[graphServiceKey] == null) {
  // @ts-ignore
  window[graphServiceKey] = new GraphService();
  const s: GraphService = window[graphServiceKey] as unknown as GraphService;
  s.addNode({
    id: '1',
    kind: NodeKind.osc,
    name: 'Node 1',
    paramValues: {},
    display: {
      bounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    },
  });

  s.addNode({
    id: '2',
    kind: NodeKind.osc,
    name: 'Node 2',
    paramValues: {},
    display: {
      bounds: {
        x: 10,
        y: 50,
        width: 0,
        height: 0,
      },
    },
  });
}

const service: GraphService = window[graphServiceKey] as unknown as GraphService;

function App() {
  const translateViewport = (e: any) => {
    service.setViewportTranslate(e);
  }

  const [appState, setAppState] = useState(getInitialGraphModel());

  useLayoutEffect(() => {
    service.state$.subscribe(setAppState);
  }, []);

  const graphAnchorStyle = {
    transform: `translate(${appState.viewportOffset.x}px, ${appState.viewportOffset.y}px)`,
  };

  const nodes = appState.nodeOrder
    .map(id => ([id, appState.nodes[id]] as [string, NodeModel]))
    .map(([id, nodeModel]: [string, NodeModel]) => {
      return (
        <Node key={id} nodeModel={nodeModel} service={service}/>
      )
    });

  return (
    <div className="App">
      <div className="GraphContainer">
        <DragToMove onDragMove={translateViewport}
                    elementPosition={service.snapshot.viewportOffset}
                    style={({minHeight: '100vh'})}>
          <div className="GraphViewportAnchor" style={graphAnchorStyle}>
            {nodes}
          </div>
        </DragToMove>
      </div>
    </div>
  );
}

export default App;
