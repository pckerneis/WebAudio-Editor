import {NodeDefinitionModel} from '../model/NodeDefinition.model';
import {NodeKind} from '../model/NodeKind.model';

export default class NodeDefinitionService {
  constructor(public readonly definitions: NodeDefinitionModel[]) {}

  getNodeDefinition(kind: NodeKind): NodeDefinitionModel {
    const definition = this.definitions.find(def => def.kind === kind);

    if (definition == null) {
      throw new Error('Cannot find node definition for kind ' + kind);
    }

    return definition;
  }
}
