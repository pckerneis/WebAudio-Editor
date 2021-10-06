import GraphService from '../GraphService';
import NodeDefinitionService from '../NodeDefinitionService';
import {PortComponentRegistry} from '../PortComponentRegistry';
import CommandService from '../CommandService';
import SelectedItemSet from '../../utils/SelectedItemSet';
import SingletonWrapper from './SingletonWrapper';
import {getNodeDefinitions} from '../../../document/node-definitions/StandardNodesDefinitions';
import GraphServiceCommandHandler from '../command-handlers/GraphServiceCommandHandler';
import getAllCommands from '../commands/Commands';
import JsonAdapterService from '../JsonAdapterService';
import ProjectService from '../ProjectService';
import MessageService from '../MessageService';
import HistoryService from '../HistoryService';
import HistoryServiceCommandHandler from '../command-handlers/HistoryServiceCommandHandler';
import LayoutService from '../LayoutService';
import PlayService from '../PlayService';
import LocaleStorageService from '../LocaleStorageService';

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
  const layoutService = SingletonWrapper.get(LayoutService);
  const historyService = SingletonWrapper.get(HistoryService, graphService, graphSelection, layoutService);
  const jsonAdapterService = SingletonWrapper.get(JsonAdapterService, graphService, projectService, graphSelection, messageService, historyService);
  const playService = SingletonWrapper.get(PlayService, jsonAdapterService, messageService);
  const localeStorageService = SingletonWrapper.get(LocaleStorageService, graphService, graphSelection, projectService, layoutService, historyService);

  if (firstInitialization) {
    commandService.registerCommandHandlers(
      new GraphServiceCommandHandler(graphService, nodeDefinitionService, graphSelection, historyService, localeStorageService, layoutService),
      new HistoryServiceCommandHandler(historyService),
    );

    const latestProject = localeStorageService.findLatestProject();
    if (latestProject != null) {
      localeStorageService.loadProject(latestProject);
    }
  }

  return {
    graphService,
    graphSelection,
    portRegistry,
    nodeDefinitionService,
    commandService,
    projectService,
    jsonAdapterService,
    messageService,
    historyService,
    layoutService,
    playService,
    localeStorageService,
  }
}

export interface Services {
  graphService: GraphService;
  nodeDefinitionService: NodeDefinitionService;
  portRegistry: PortComponentRegistry;
  commandService: CommandService;
  graphSelection: SelectedItemSet<string>;
  projectService: ProjectService;
  jsonAdapterService: JsonAdapterService;
  messageService: MessageService;
  historyService: HistoryService;
  layoutService: LayoutService;
  playService: PlayService;
  localeStorageService: LocaleStorageService;
}
