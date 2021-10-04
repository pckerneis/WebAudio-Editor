import {NodeKind} from './document/models/NodeKind';
import GraphService from './front-end/service/GraphService';
import SelectedItemSet from './front-end/utils/SelectedItemSet';
import HistoryService from './front-end/service/HistoryService';
import NodeDefinitionService from './front-end/service/NodeDefinitionService';

export function loadDemoProject(graphService: GraphService,
                                graphSelection: SelectedItemSet<string>,
                                historyService: HistoryService,
                                nodeDefinitionService: NodeDefinitionService): void {
  const osc = graphService.createAndAddNode('osc',
    nodeDefinitionService.getNodeDefinition(NodeKind.osc)!,
    {x: 120, y: 20, width: 100, height: 20});

  const gain1 = graphService.createAndAddNode('gain1',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 150, y: 300, width: 100, height: 20});

  const gain2 = graphService.createAndAddNode('gain2',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 200, y: 150, width: 100, height: 20});

  graphService.addConnection(osc.id, 0, gain1.id, 0);
  graphService.addConnection(gain1.id, 0, gain2.id, 0);
  graphService.addConnection(osc.id, 0, gain2.id, 0);

  graphSelection.addToSelection(osc.id);

  historyService.pushTransaction('Demo project loaded');
}
