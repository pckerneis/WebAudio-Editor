import GraphService from './front-end/service/GraphService';
import SelectedItemSet from './front-end/utils/SelectedItemSet';
import NodeDefinitionService from './front-end/service/NodeDefinitionService';
import {NodeKind} from './front-end/model/NodeKind.model';

export function loadDemoProject(service: GraphService, graphSelection: SelectedItemSet<string>,
                         nodeDefinitionService: NodeDefinitionService): void {

  const osc = service.createAndAddNode('osc',
    nodeDefinitionService.getNodeDefinition(NodeKind.osc)!,
    {x: 120, y: 20, width: 100, height: 20});

  const gain1 = service.createAndAddNode('gain1',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 150, y: 300, width: 100, height: 20});

  const gain2 = service.createAndAddNode('gain2',
    nodeDefinitionService.getNodeDefinition(NodeKind.gain)!,
    {x: 200, y: 150, width: 100, height: 20});

  service.addConnection(osc.id, 0, gain1.id, 0);
  service.addConnection(gain1.id, 0, gain2.id, 0);
  service.addConnection(osc.id, 0, gain2.id, 0);

  graphSelection.addToSelection(osc.id);
}
