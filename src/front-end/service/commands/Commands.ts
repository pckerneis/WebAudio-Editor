import {Command} from '../CommandService';
import {makeGraphServiceCommands} from '../command-handlers/GraphServiceCommandHandler';

export default function getAllCommands(): Command[] {
  return [
    ...makeGraphServiceCommands(),
  ];
}
