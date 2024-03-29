import {NodeDefinition} from '../../document/node-definitions/NodeDefinition';
import {NodeKind} from '../../document/models/NodeKind';

export default class NodeDefinitionService {
  constructor(public readonly definitions: NodeDefinition[]) {}

  getNodeDefinition(kind: NodeKind): NodeDefinition | null {
    if (isUndefinedNodeKind(kind)) {
      return null;
    }

    const definition = this.definitions.find(def => def.kind === kind);

    if (definition == null) {
      throw new Error('Cannot find node definition for kind ' + kind);
    }

    return definition;
  }
}

function isUndefinedNodeKind(kind: NodeKind): boolean {
  return [
    NodeKind.destination,
  ].includes(kind);
}
