import {NodeKind} from '../models/NodeKind';

export interface NodeDefinition {
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
  acceptsInput: boolean,
}

export interface NumberParamDefinition {
  type: ParamType.number;
  name: string;
  defaultValue: number;
  min?: number;
  max?: number;
}

export interface BooleanParamDefinition {
  type: ParamType.boolean;
  name: string;
  defaultValue: boolean;
}

export type ParamDefinition =
  ChoiceParamDefinition
  | AudioParamDefinition
  | NumberParamDefinition
  | BooleanParamDefinition;

export enum ParamType {
  choice = 'choice',
  AudioParam = 'AudioParam',
  number = 'number',
  boolean = 'boolean',
}
