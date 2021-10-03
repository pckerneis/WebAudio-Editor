import {ProjectDocument} from '../document/ProjectDocument';
import {isValidProjectDocument} from '../document/validation/project-document-validation';
import WebAudioGraphBuilderOptions from './WebAudioGraphBuilderOptions';
import {NodeModel} from '../document/models/NodeModel';
import {NodeKind} from '../document/models/NodeKind';
import {ConnectionModel} from '../document/models/ConnectionModel';

interface BuildResult {
  error?: any;
  audioGraph: AudioGraph | null;
}

type AudioNodes = { [id: string]: AudioNode; };

interface AudioGraph {
  context: AudioContext;
  nodes: AudioNodes;
  connections: Connection[];
}

interface Connection {
  source: string;
  target: string;
}

export class WebAudioGraphBuilder {
  validate(document: ProjectDocument): void {
    isValidProjectDocument(document);
  }

  build(document: ProjectDocument,
        options: Partial<WebAudioGraphBuilderOptions>): BuildResult {
    try {
      return {
        audioGraph: this.doBuild(document, options),
      }
    } catch (error) {
      return {
        error,
        audioGraph: null,
      };
    }
  }

  private doBuild(document: ProjectDocument,
                  options: Partial<WebAudioGraphBuilderOptions>): AudioGraph {
    const context = options.audioContext ?? new AudioContext(options?.audioContextOptions);
    const nodes: AudioNodes = {};

    Object.entries(document.audioGraph.nodes).forEach(([id, model]) => {
      nodes[id] = this.buildNode(model, context);
    });

    document.audioGraph.connections.forEach(connection => {
      this.applyConnection(connection, nodes, document);
    });

    const connections = document.audioGraph.connections.map(c => ({source: c.source, target: c.target}));

    return {
      connections, context, nodes,
    };
  }

  private buildNode(nodeModel: NodeModel, ctx: AudioContext): AudioNode {
    return nodeBuilders[nodeModel.kind](ctx);
  }

  private applyConnection(connection: ConnectionModel, nodes: AudioNodes, document: ProjectDocument): void {
    const firstMatch = this.findConnectionMatch(connection.source, document);
    const secondMatch = this.findConnectionMatch(connection.target, document);

    if (firstMatch && secondMatch) {
      connectIfLegal(firstMatch, secondMatch, nodes);
      connectIfLegal(secondMatch, firstMatch, nodes);
    } else {
      throw new Error(`Could not connect ports ${connection.source} and ${connection.target}.`);
    }
  }

  private findConnectionMatch(portId: string, document: ProjectDocument): ConnectionMatch | undefined {
    return Object.values(document.audioGraph.nodes).map(node => {
      const nodeId = node.id;
      const inputIndex = node.inputPorts.map(p => p.id).indexOf(portId);

      if (inputIndex > 0) {
        return {
          kind: ConnectionMatchKind.nodeInput,
          nodeId,
          inputIndex,
        } as ConnectionMatch;
      }


      const outputIndex = node.outputPorts.map(p => p.id).indexOf(portId);

      if (outputIndex > 0) {
        return {
          kind: ConnectionMatchKind.nodeOutput,
          nodeId,
          outputIndex,
        } as ConnectionMatch;
      }

      const audioParamName = Object.entries(node.paramPorts)
        .filter(([, port]) => port.id === portId)
        .map(([param]) => param)[0];

      if (audioParamName != null) {
        return {
          kind: ConnectionMatchKind.nodeAudioParam,
          nodeId,
          audioParamName,
        } as ConnectionMatch;
      }

      return undefined;
    }).filter(Boolean)[0];
  }
}

enum ConnectionMatchKind {
  nodeInput = 'nodeInput',
  nodeOutput = 'nodeOutput',
  nodeAudioParam = 'nodeAudioParam',
}

interface NodeInputMatch {
  kind: ConnectionMatchKind.nodeInput;
  nodeId: string;
  inputIndex: number;
}

interface NodeOutputMatch {
  kind: ConnectionMatchKind.nodeOutput;
  nodeId: string;
  outputIndex: number;
}

interface NodeAudioParamMatch {
  kind: ConnectionMatchKind.nodeAudioParam;
  nodeId: string;
  audioParamName: string;
}

type ConnectionMatch = NodeInputMatch
  | NodeOutputMatch
  | NodeAudioParamMatch;

type AudioNodeBuilders = { [kind in NodeKind]: (ctx: AudioContext, ...args: any[]) => AudioNode };

const nodeBuilders: AudioNodeBuilders = {
  [NodeKind.osc]: (ctx: AudioContext) => ctx.createOscillator(),
  [NodeKind.gain]: (ctx: AudioContext) => ctx.createGain(),
  [NodeKind.delay]: (ctx: AudioContext, ...args: any[]) => ctx.createDelay(args[0]),
  [NodeKind.analyser]: (ctx: AudioContext) => ctx.createAnalyser(),
  [NodeKind.biquadFilter]: (ctx: AudioContext) => ctx.createBiquadFilter(),
  [NodeKind.audioBufferSource]: (ctx: AudioContext) => ctx.createBufferSource(),
  [NodeKind.channelMerger]: (ctx: AudioContext, ...args: any[]) => ctx.createChannelMerger(args[0]),
  [NodeKind.channelSplitter]: (ctx: AudioContext, ...args: any[]) => ctx.createChannelSplitter(args[0]),
  [NodeKind.constantSource]: (ctx: AudioContext) => ctx.createConstantSource(),
  [NodeKind.convolver]: (ctx: AudioContext) => ctx.createConvolver(),
  [NodeKind.dynamicsCompressor]: (ctx: AudioContext) => ctx.createDynamicsCompressor(),
  [NodeKind.iirFilter]: (ctx: AudioContext, ...args: any[]) => ctx.createIIRFilter(args[0], args[1]),
  [NodeKind.mediaElementAudioSource]: (ctx: AudioContext, ...args: any[]) => ctx.createMediaElementSource(args[0]),
  [NodeKind.mediaStreamAudioDestination]: (ctx: AudioContext) => ctx.createMediaStreamDestination(),
  [NodeKind.mediaStreamAudioSource]: (ctx: AudioContext, ...args: any[]) => ctx.createMediaStreamSource(args[0]),
  [NodeKind.panner]: (ctx: AudioContext) => ctx.createPanner(),
}

function connectIfLegal(firstMatch: ConnectionMatch, secondMatch: ConnectionMatch, nodes: AudioNodes): boolean {
  if (firstMatch.kind === ConnectionMatchKind.nodeOutput) {
    if (secondMatch.kind === ConnectionMatchKind.nodeInput) {
      const sourceNode = nodes[firstMatch.nodeId];
      const targetNode = nodes[secondMatch.nodeId];
      sourceNode.connect(targetNode, firstMatch.outputIndex, secondMatch.inputIndex);
      return true;
    }

    if (secondMatch.kind === ConnectionMatchKind.nodeAudioParam) {
      const sourceNode = nodes[firstMatch.nodeId];
      const targetNode = nodes[secondMatch.nodeId] as any;
      const targetParam = targetNode[secondMatch.audioParamName as any] as any;
      sourceNode.connect(targetParam as any, firstMatch.outputIndex);
      return true;
    }
  }

  return false;
}
