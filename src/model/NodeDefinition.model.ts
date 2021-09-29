import {NodeKind} from './NodeKind.model';

export interface NodeDefinitionModel {
  kind: NodeKind;
  params: ParamDefinition[];
  inputPortCount: number;
  outputPortCount: number;
}

export interface ChoiceParamDefinition {
  type: ParamType.choice;
  name: string;
  possibleValues: string[];
  defaultValue: string;
}
export interface AudioParamDefinition {
  type: ParamType.AudioParam;
  name: string;
  defaultValue: number;
  min?: number;
  max?: number;
}

export type ParamDefinition = ChoiceParamDefinition | AudioParamDefinition;

export enum ParamType {
  choice,
  AudioParam,
}
