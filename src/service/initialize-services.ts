import GraphService from './GraphService';
import NodeDefinitionService from './NodeDefinitionService';
import {PortComponentRegistry} from './PortComponentRegistry';
import CommandService from './CommandService';
import SelectedItemSet from '../utils/SelectedItemSet';
import SingletonWrapper from './SingletonWrapper';
import {getNodeDefinitions} from '../model/StandardNodesDefinitions';
import {loadDemoProject} from '../project-setup';
import CreateNodeCommandHandler from './command-handlers/CreateNodeCommandHandler';
import getAllCommands from './commands/Commands';

export default function initializeOrGetServices(): Services {
  const firstInitialization = ! SingletonWrapper.hasInstance(GraphService);

  const graphService = SingletonWrapper.get(GraphService);
  const graphSelection = SingletonWrapper.get(SelectedItemSet) as SelectedItemSet<string>;
  const portRegistry = SingletonWrapper.get(PortComponentRegistry);
  const nodeDefinitionService = SingletonWrapper
    .get(NodeDefinitionService, getNodeDefinitions());
  const commandService = SingletonWrapper.get(CommandService, getAllCommands());

  if (firstInitialization) {
    loadDemoProject(graphService, graphSelection, nodeDefinitionService);

    commandService.registerCommandHandler(
      new CreateNodeCommandHandler(graphService, nodeDefinitionService),
    );
  }

  return {
    graphService,
    graphSelection,
    portRegistry,
    nodeDefinitionService,
    commandService,
  }
}

export interface Services {
  graphService: GraphService;
  nodeDefinitionService: NodeDefinitionService;
  portRegistry: PortComponentRegistry;
  commandService: CommandService;
  graphSelection: SelectedItemSet<string>;
}
