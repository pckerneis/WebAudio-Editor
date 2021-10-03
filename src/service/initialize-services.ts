import GraphService from './GraphService';
import NodeDefinitionService from './NodeDefinitionService';
import {PortComponentRegistry} from './PortComponentRegistry';
import CommandService from './CommandService';
import SelectedItemSet from '../utils/SelectedItemSet';
import SingletonWrapper from './SingletonWrapper';
import {getNodeDefinitions} from '../model/StandardNodesDefinitions';
import {loadDemoProject} from '../project-setup';
import GraphServiceCommandHandler from './command-handlers/GraphServiceCommandHandler';
import getAllCommands from './commands/Commands';
import PersistenceService from './PersistenceService';
import ProjectService from './ProjectService';

export default function initializeOrGetServices(): Services {
  const firstInitialization = ! SingletonWrapper.hasInstance(GraphService);

  const graphService = SingletonWrapper.get(GraphService);
  const graphSelection = SingletonWrapper.get(SelectedItemSet) as SelectedItemSet<string>;
  const portRegistry = SingletonWrapper.get(PortComponentRegistry);
  const nodeDefinitionService = SingletonWrapper
    .get(NodeDefinitionService, getNodeDefinitions());
  const commandService = SingletonWrapper.get(CommandService, getAllCommands());
  const projectService = SingletonWrapper.get(ProjectService);
  const persistenceService = SingletonWrapper.get(PersistenceService, graphService, projectService, graphSelection);

  if (firstInitialization) {
    loadDemoProject(graphService, graphSelection, nodeDefinitionService);

    commandService.registerCommandHandler(
      new GraphServiceCommandHandler(graphService, nodeDefinitionService, graphSelection),
    );
  }

  return {
    graphService,
    graphSelection,
    portRegistry,
    nodeDefinitionService,
    commandService,
    projectService,
    persistenceService,
  }
}

export interface Services {
  graphService: GraphService;
  nodeDefinitionService: NodeDefinitionService;
  portRegistry: PortComponentRegistry;
  commandService: CommandService;
  graphSelection: SelectedItemSet<string>;
  projectService: ProjectService;
  persistenceService: PersistenceService;
}
