import {NodeKind} from './NodeKind.model';
import {NodeDefinitionModel, ParamType} from './NodeDefinition.model';

// From the specs : This value is approximately 1200 log2 FLT_MAX where FLT_MAX is the largest float value.
const MAX_DETUNE = 153600;

// TODO externalize data to JSON and add metadata such as library ID and version
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
    },

    {
      kind: NodeKind.analyser,
      inputPortCount: 1,
      outputPortCount: 0,
      params: [],
    },

    {
      kind: NodeKind.biquadFilter,
      inputPortCount: 1,
      outputPortCount: 1,
      params: [
        {
          name: 'frequency',
          type: ParamType.AudioParam,
          defaultValue: 350,
          acceptsInput: true,
        },
        {
          name: 'detune',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
        {
          name: 'Q',
          type: ParamType.AudioParam,
          defaultValue: 1,
          acceptsInput: true,
        },
        {
          name: 'gain',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
      ],
    },

    {
      kind: NodeKind.audioBufferSource,
      inputPortCount: 0,
      outputPortCount: 1,
      params: [
        {
          name: 'playbackRate',
          type: ParamType.AudioParam,
          defaultValue: 1,
          acceptsInput: true,
        },
        {
          name: 'detune',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
      ],
    },

    {
      kind: NodeKind.channelMerger,
      inputPortCount: 6,
      outputPortCount: 1,
      params: [
        {
          name: 'numberOfInputs',
          type: ParamType.number,
          defaultValue: 6,
        },
      ],
    },

    {
      kind: NodeKind.channelSplitter,
      inputPortCount: 1,
      outputPortCount: 6,
      params: [
        {
          name: 'numberOfOutputs',
          type: ParamType.number,
          defaultValue: 6,
        },
      ],
    },

    {
      kind: NodeKind.constantSource,
      inputPortCount: 0,
      outputPortCount: 1,
      params: [
        {
          name: 'offset',
          type: ParamType.AudioParam,
          defaultValue: 1,
          acceptsInput: true,
        },
      ],
    },

    {
      kind: NodeKind.convolver,
      inputPortCount: 1,
      outputPortCount: 1,
      params: [
        {
          name: 'normalize',
          type: ParamType.boolean,
          defaultValue: true,
        },
      ],
    },

    {
      kind: NodeKind.delay,
      inputPortCount: 1,
      outputPortCount: 1,
      params: [
        {
          name: 'delayTime',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
      ],
    },

    {
      kind: NodeKind.dynamicsCompressor,
      inputPortCount: 1,
      outputPortCount: 1,
      params: [
        {
          name: 'threshold',
          type: ParamType.AudioParam,
          defaultValue: -24,
          acceptsInput: true,
          min: -100,
          max: 0,
        },
        {
          name: 'knee',
          type: ParamType.AudioParam,
          defaultValue: 30,
          acceptsInput: true,
          min: 0,
          max: 40,
        },
        {
          name: 'ratio',
          type: ParamType.AudioParam,
          defaultValue: 12,
          acceptsInput: true,
          min: 1,
          max: 20,
        },
        {
          name: 'attack',
          type: ParamType.AudioParam,
          defaultValue: 0.003,
          acceptsInput: true,
          min: 0,
          max: 1,
        },
        {
          name: 'release',
          type: ParamType.AudioParam,
          defaultValue: 0.25,
          acceptsInput: true,
          min: 0,
          max: 1,
        },
      ],
    },

    {
      kind: NodeKind.iirFilter,
      inputPortCount: 1,
      outputPortCount: 1,
      params: [],
    },

    {
      kind: NodeKind.mediaElementAudioSource,
      inputPortCount: 0,
      outputPortCount: 1,
      params: [],
    },

    {
      kind: NodeKind.mediaStreamAudioDestination,
      inputPortCount: 1,
      outputPortCount: 0,
      params: [],
    },

    {
      kind: NodeKind.mediaStreamAudioSource,
      inputPortCount: 0,
      outputPortCount: 1,
      params: [],
    },

    {
      kind: NodeKind.mediaStreamTrackAudioSource,
      inputPortCount: 0,
      outputPortCount: 1,
      params: [],
    },

    {
      kind: NodeKind.panner,
      inputPortCount: 0,
      outputPortCount: 1,
      params: [
        {
          name: 'panningModel',
          type: ParamType.choice,
          defaultValue: 'equalpower',
          possibleValues: ['equalpower', 'HRTF'],
        },
        {
          name: 'positionX',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
        {
          name: 'positionY',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
        {
          name: 'positionZ',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
        {
          name: 'orientationX',
          type: ParamType.AudioParam,
          defaultValue: 1,
          acceptsInput: true,
        },
        {
          name: 'orientationY',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
        {
          name: 'orientationZ',
          type: ParamType.AudioParam,
          defaultValue: 0,
          acceptsInput: true,
        },
        {
          name: 'distanceModel',
          type: ParamType.choice,
          defaultValue: 'inverse',
          possibleValues: ['linear', 'inverse', 'exponential'],
        },
        {
          name: 'refDistance',
          type: ParamType.number,
          defaultValue: 1,
          min: 0,
        },
        {
          name: 'maxDistance',
          type: ParamType.number,
          defaultValue: 10000,
          min: 0,
        },
        {
          name: 'rolloffFactor',
          type: ParamType.number,
          defaultValue: 1,
          min: 0,
        },
        {
          name: 'coneInnerAngle',
          type: ParamType.number,
          defaultValue: 360,
          min: 0,
          max: 360,
        },
        {
          name: 'coneOuterAngle',
          type: ParamType.number,
          defaultValue: 360,
          min: 0,
          max: 360,
        },
        {
          name: 'coneOuterGain',
          type: ParamType.number,
          defaultValue: 0,
          min: 0,
          max: 1,
        },

      ],
    },
  ];
}
