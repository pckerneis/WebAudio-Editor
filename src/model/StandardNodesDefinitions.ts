import {NodeKind} from './NodeKind.model';
import {NodeDefinitionModel, ParamType} from './NodeDefinition.model';

// From the specs : This value is approximately 1200 log2 FLT_MAX where FLT_MAX is the largest float value.
const MAX_DETUNE = 153600;

export function getNodeDefinitions(): NodeDefinitionModel[] {
  return [
    {
      kind: NodeKind.osc,
      inputPortCount: 0,
      outputPortCount: 1,
      params: [
        {
          name: 'type',
          type: ParamType.choice,
          possibleValues: ['sine', 'square', 'sawtooth', 'triangle', 'custom'],
          defaultValue: 'sine',
        },
        {
          name: 'frequency',
          type: ParamType.AudioParam,
          defaultValue: 440,
          acceptsInput: true,
        },
        {
          name: 'detune',
          type: ParamType.AudioParam,
          defaultValue: 0,
          min: -MAX_DETUNE,
          max: MAX_DETUNE,
          acceptsInput: true,
        }
      ],
    },
    {
      kind: NodeKind.gain,
      inputPortCount: 1,
      outputPortCount: 1,
      params: [
        {
          name: 'gain',
          type: ParamType.AudioParam,
          defaultValue: 1,
          acceptsInput: true,
        },
      ],
    }
  ];
}
