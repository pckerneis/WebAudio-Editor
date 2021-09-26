import React, {useLayoutEffect, useState} from 'react';
import './App.css';
import DragToMove from './ui-utils/DragToMove';
import GraphService from './service/GraphService';
import Node from './components/Node/Node';
import {NodeKind} from './model/NodeKind.model';
import SingletonWrapper from './service/SingletonWrapper';
import NodeDefinitionService from './service/NodeDefinitionService';
import {getNodeDefinitions} from './model/NodeDefinition.model';
import {getInitialGraphModel} from './state/GraphState';
import {NodeState} from './state/NodeState';

const serviceWrapper = SingletonWrapper.lazyWrap(GraphService);

if (! SingletonWrapper.hasInstance(GraphService)) {
  const s = serviceWrapper.get();

  s.addNode({
    id: '1',
    kind: NodeKind.osc,
    name: 'Node 1',
    paramValues: {
      type: 'osc',
    },
    display: {
      folded: true,
      bounds: {
        x: 0,
        y: 0,
        width: 100,
        height: 20,
      },
    },
  });

  s.addNode({
    id: '2',
    kind: NodeKind.osc,
    name: 'Node 2',
    paramValues: {},
    display: {
      folded: false,
      bounds: {
        x: 10,
        y: 50,
        width: 100,
        height: 0,
      },
    },
  });
}

const service = serviceWrapper.get();
const nodeDefinitionService = SingletonWrapper
  .create(NodeDefinitionService, getNodeDefinitions())
  .get();

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
    .map(id => ([id, appState.nodes[id]] as [string, NodeState]))
    .map(([id, nodeState]: [string, NodeState]) => {
      const definition = nodeDefinitionService.getNodeDefinition(nodeState.kind) ?? {};
      return (
        <Node key={id} nodeState={nodeState} service={service} definition={definition}/>
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
