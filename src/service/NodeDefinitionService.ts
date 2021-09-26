import {NodeDefinitionModel} from '../model/NodeDefinition.model';
import {NodeKind} from '../model/NodeKind.model';

export default class NodeDefinitionService {
  constructor(public readonly definitions: NodeDefinitionModel[]) {}

  getNodeDefinition(kind: NodeKind) {
    return this.definitions.find(def => def.kind === kind);
  }
}
