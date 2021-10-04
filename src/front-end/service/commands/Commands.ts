import {Command} from '../CommandService';
import {makeGraphServiceCommands} from '../command-handlers/GraphServiceCommandHandler';
import {makeHistoryServiceCommands} from '../command-handlers/HistoryServiceCommandHandler';

export default function getAllCommands(): Command[] {
  return [
    ...makeGraphServiceCommands(),
    ...makeHistoryServiceCommands(),
  ];
}
