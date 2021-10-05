import GraphService from '../GraphService';
import NodeDefinitionService from '../NodeDefinitionService';
import {PortComponentRegistry} from '../PortComponentRegistry';
import CommandService from '../CommandService';
import SelectedItemSet from '../../utils/SelectedItemSet';
import SingletonWrapper from './SingletonWrapper';
import {getNodeDefinitions} from '../../../document/node-definitions/StandardNodesDefinitions';
import {loadDemoProject} from '../../../project-setup';
import GraphServiceCommandHandler from '../command-handlers/GraphServiceCommandHandler';
import getAllCommands from '../commands/Commands';
import PersistenceService from '../PersistenceService';
import ProjectService from '../ProjectService';
import MessageService from '../MessageService';
import HistoryService from '../HistoryService';
import HistoryServiceCommandHandler from '../command-handlers/HistoryServiceCommandHandler';
import LayoutService from '../LayoutService';

export default function initializeOrGetServices(): Services {
  const firstInitialization = ! SingletonWrapper.hasInstance(GraphService);

  const graphService = SingletonWrapper.get(GraphService);
  const graphSelection = SingletonWrapper.get(SelectedItemSet) as SelectedItemSet<string>;
  const portRegistry = SingletonWrapper.get(PortComponentRegistry);
  const nodeDefinitionService = SingletonWrapper
    .get(NodeDefinitionService, getNodeDefinitions());
  const commandService = SingletonWrapper.get(CommandService, getAllCommands());
  const projectService = SingletonWrapper.get(ProjectService);
  const messageService = SingletonWrapper.get(MessageService);
  const historyService = SingletonWrapper.get(HistoryService, graphService, graphSelection);
  const persistenceService = SingletonWrapper.get(PersistenceService, graphService, projectService, graphSelection, messageService, historyService);
  const layoutService = SingletonWrapper.get(LayoutService);

  if (firstInitialization) {
    loadDemoProject(
      graphService,
      graphSelection,
      historyService,
      nodeDefinitionService);

    commandService.registerCommandHandlers(
      new GraphServiceCommandHandler(graphService, nodeDefinitionService, graphSelection, historyService),
      new HistoryServiceCommandHandler(historyService),
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
    messageService,
    historyService,
    layoutService,
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
  messageService: MessageService;
  historyService: HistoryService;
  layoutService: LayoutService;
}
