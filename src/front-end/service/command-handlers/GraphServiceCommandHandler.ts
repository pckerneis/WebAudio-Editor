import {Command, CommandHandler} from '../CommandService';
import GraphService, {DEFAULT_NODE_WIDTH} from '../GraphService';
import NodeDefinitionService from '../NodeDefinitionService';
import {GraphState} from '../../state/GraphState';
import SelectedItemSet from '../../utils/SelectedItemSet';
import {isNodeKind, NodeKind} from '../../../document/models/NodeKind';
import HistoryService, {TransactionNames} from '../HistoryService';
import LocaleStorageService from '../LocaleStorageService';
import Coordinates from '../../../document/models/Coordinates';
import LayoutService from '../LayoutService';

const DELETE_SELECTION_COMMAND_ID = 'DeleteSelection';
const CREATE_NODE_COMMAND_PREFIX = 'CreateNode/';

export default class GraphServiceCommandHandler implements CommandHandler {
  constructor(public readonly graphService: GraphService,
              public readonly nodeDefinitionService: NodeDefinitionService,
              public readonly graphSelection: SelectedItemSet<string>,
              public readonly historyService: HistoryService,
              public readonly localeStorageService: LocaleStorageService,
              public readonly layoutService: LayoutService) {
  }

  public canExecute(commandPath: string): boolean {
    if (!isSupportedCommand(commandPath)) {
      return false;
    }

    if (commandPath === DELETE_SELECTION_COMMAND_ID) {
      return ! this.graphSelection.isSelectionEmpty();
    }

    return true;
  }

  public executeCommand(commandPath: string): boolean {
    return this.executeCreateNodeCommand(commandPath)
      || this.executeDeleteSelectionCommand(commandPath)
      || false;
  }

  private executeCreateNodeCommand(commandPath: string): boolean {
    if (isCreateNodeCommand(commandPath)) {
      const nodeKind = extractNodeKindFromCreateNodeCommand(commandPath);
      this.createAndAddNode(nodeKind as NodeKind, this.layoutService.snapshot.viewportOffset);
      this.historyService.pushTransaction(TransactionNames.CREATE_NODE);
      return true;
    }

    return false;
  }

  private executeDeleteSelectionCommand(commandPath: string): boolean {
    if (commandPath === DELETE_SELECTION_COMMAND_ID) {
      const selection = this.graphSelection.items;

      if (selection.length > 0) {
        this.graphService.remove(this.graphSelection.items);
        this.historyService.pushTransaction(TransactionNames.DELETE_SELECTION);
      }
    }

    return false;
  }

  private createAndAddNode(nodeKind: NodeKind, viewportOffset: Coordinates): void {
    // TODO use graph bounds instead of window
    const bounds = {
      x: window.innerWidth / 2 - viewportOffset.x - 50,
      y: window.innerHeight / 2 - viewportOffset.y - 10,
      width: DEFAULT_NODE_WIDTH,
      height: 20,
    };

    if (nodeKind === NodeKind.destination) {
      this.graphService.addAudioDestination(bounds);
    } else {
      const nodeDefinition = this.nodeDefinitionService.getNodeDefinition(nodeKind);
      const name = findDefaultName(nodeKind, this.graphService.snapshot);
      this.graphService.createAndAddNode(name, nodeDefinition!, bounds);
    }
  }
}

type DesiredNames = {
  [kind in NodeKind]: string;
}

const desiredNames: DesiredNames = {
  [NodeKind.analyser]: 'analyser',
  [NodeKind.bufferSource]: 'audioBufferSource',
  [NodeKind.biquadFilter]: 'biquadFilter',
  [NodeKind.channelMerger]: 'channelMerger',
  [NodeKind.channelSplitter]: 'channelSplitter',
  [NodeKind.constantSource]: 'constantSource',
  [NodeKind.convolver]: 'convolver',
  [NodeKind.delay]: 'delay',
  [NodeKind.dynamicsCompressor]: 'dynamicsCompressor',
  [NodeKind.gain]: 'gain',
  [NodeKind.iirFilter]: 'iirFilter',
  [NodeKind.mediaElementSource]: 'mediaElementAudioSource',
  [NodeKind.mediaStreamDestination]: 'mediaStreamAudioDestination',
  [NodeKind.mediaStreamSource]: 'mediaStreamAudioSource',
  [NodeKind.osc]: 'osc',
  [NodeKind.panner]: 'panner',
  [NodeKind.stereoPanner]: 'stereoPanner',
  [NodeKind.waveShaper]: 'waveShaper',
  [NodeKind.destination]: 'destination',
};


function findDefaultName(nodeKind: NodeKind, graphState: GraphState): string {
  const desiredName = desiredNames[nodeKind];
  return makeUniqueName(desiredName, graphState);
}

function makeUniqueName(desiredName: string, graphState: GraphState): string {
  const existingNodeNames = Object.values(graphState.nodes).map(n => n.name);
  if (!existingNodeNames.includes(desiredName)) {
    return desiredName;
  }

  let suffixNumber = 0;
  let candidate: string;

  do {
    candidate = `${desiredName} (${++suffixNumber})`;
  }
  while (existingNodeNames.includes(candidate));

  return candidate;
}

export function makeGraphServiceCommands(): Command[] {
  return [
    ...Object.values(NodeKind).map((kind) => ({
      path: 'CreateNode/' + kind,
      label: 'Create ' + decamelized(kind) + ' node',
    })),
    {
      label: 'Delete selected items',
      path: DELETE_SELECTION_COMMAND_ID,
      keyboardShortcuts: [['Del'], ['Suppr']],
    },
  ];
}

function isCreateNodeCommand(commandPath: string): boolean {
  if (commandPath.includes(CREATE_NODE_COMMAND_PREFIX)) {
    const candidateNodeKind = extractNodeKindFromCreateNodeCommand(commandPath);
    if (isNodeKind(candidateNodeKind)) {
      return true;
    }
  }

  return false;
}

function extractNodeKindFromCreateNodeCommand(commandPath: string): string {
  return commandPath.replace(CREATE_NODE_COMMAND_PREFIX, '');
}

function isSupportedCommand(commandPath: string): boolean {
  return isCreateNodeCommand(commandPath)
    || commandPath === DELETE_SELECTION_COMMAND_ID;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function decamelized(str: string): string {
  let r = '';

  for (const c of str) {
    if (UPPERCASE.includes(c)) {
      r += ' ' + c.toLocaleLowerCase();
    } else {
      r += c;
    }
  }

  return r;
}

