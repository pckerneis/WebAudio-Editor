import {NodeKind} from './document/models/NodeKind';
import GraphService, {DEFAULT_NODE_WIDTH} from './front-end/service/GraphService';
import SelectedItemSet from './front-end/utils/SelectedItemSet';
import HistoryService from './front-end/service/HistoryService';
import NodeDefinitionService from './front-end/service/NodeDefinitionService';

export function loadDemoProject(graphService: GraphService,
                                graphSelection: SelectedItemSet<string>,
                                historyService: HistoryService,
                                nodeDefinitionService: NodeDefinitionService): void {
  const osc = graphService.createAndAddNode('osc',
    nodeDefinitionService.getNodeDefinition(NodeKind.osc)!,
    {x: 200, y: 140, width: DEFAULT_NODE_WIDTH, height: 20});

  const gain1 = graphService.createAndAddNode('gain1',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 300, y: 220, width: DEFAULT_NODE_WIDTH, height: 20});

  const gain2 = graphService.createAndAddNode('gain2',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 200, y: 300, width: DEFAULT_NODE_WIDTH, height: 20});

  graphService.addConnection(osc.id, 0, gain1.id, 0);
  graphService.addConnection(gain1.id, 0, gain2.id, 0);
  graphService.addConnection(osc.id, 0, gain2.id, 0);

  graphService.createAndAddContainer('container', {
    x: 180,
    y: 90,
    width: 300,
    height: 320,
  });

  graphSelection.addToSelection(osc.id);

  historyService.pushTransaction('Demo project loaded');
}
