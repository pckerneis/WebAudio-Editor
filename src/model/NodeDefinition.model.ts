import {NodeKind} from './NodeKind.model';

export interface NodeDefinitionModel {
  kind: NodeKind;
  params: ParamDefinition[];
  inputPortCount: number;
  outputPortCount: number;
}

export interface ParamDefinition {
  name: string;
  type: ParamType;
}

export type ParamType = 'string' | 'AudioParam';

export function getNodeDefinitions(): NodeDefinitionModel[] {
  return [
    {
      kind: NodeKind.osc,
      inputPortCount: 1,
      outputPortCount: 1,
      params: [
        {name: 'type', type: 'string'}
      ],
    }
  ];
}
