import {CommandHandler} from '../CommandService';
import {CommandPaths} from '../commands/Commands';
import {NodeKind} from '../../model/NodeKind.model';
import GraphService from '../GraphService';
import NodeDefinitionService from '../NodeDefinitionService';
import {GraphState} from '../../state/GraphState';

export default class CreateNodeCommandHandler implements CommandHandler {
  constructor(public readonly graphService: GraphService,
              public readonly nodeDefinitionService: NodeDefinitionService) {
  }

  executeCommand(commandPath: string): boolean {
    switch (commandPath) {
      case CommandPaths.CreateOscillatorNode:
        this.createAndAddNode(NodeKind.osc);
        return true;
      case CommandPaths.CreateDelayNode:
        this.createAndAddNode(NodeKind.delay);
        return true;
      case CommandPaths.CreateGainNode:
        this.createAndAddNode(NodeKind.gain);
        return true;
      default:
        return false;
    }
  }

  private createAndAddNode(nodeKind: NodeKind): void {
    const nodeDefinition = this.nodeDefinitionService.getNodeDefinition(nodeKind);
    const viewportOffset = this.graphService.snapshot.viewportOffset;
    const bounds = {
      x: window.innerWidth / 2 - viewportOffset.x - 50,
      y: window.innerHeight / 2 - viewportOffset.y - 10,
      width: 100,
      height: 20,
    };
    const name = findDefaultName(nodeKind, this.graphService.snapshot);
    this.graphService.createAndAddNode(name, nodeDefinition, bounds);
  }
}

const desiredNames = {
  [NodeKind.gain]: 'gain',
  [NodeKind.osc]: 'osc',
  [NodeKind.delay]: 'delay',
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
