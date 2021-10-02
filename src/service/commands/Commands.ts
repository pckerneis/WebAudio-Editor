import {Command} from '../CommandService';

export enum CommandPaths {
  CreateOscillatorNode = 'Create/Node/OscillatorNode',
  CreateGainNode = 'Create/Node/GainNode',
  CreateDelayNode = 'Create/Node/DelayNode',
}

export default function getAllCommands(): Command[] {
  return [
    {
      path: CommandPaths.CreateOscillatorNode,
      label: 'Create OscillatorNode',
      description: 'Creates an OscillatorNode'
    },
    {
      path: CommandPaths.CreateGainNode,
      label: 'Create GainNode',
      description: 'Creates an GainNode'
    },
    {
      path: CommandPaths.CreateDelayNode,
      label: 'Create DelayNode',
      description: 'Creates an DelayNode'
    },
  ];
}
