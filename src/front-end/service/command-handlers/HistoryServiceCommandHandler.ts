import HistoryService from '../HistoryService';
import {Command, CommandHandler} from '../CommandService';

const UNDO_COMMAND_ID = 'Undo';
const REDO_COMMAND_ID = 'Redo';

export default class HistoryServiceCommandHandler implements CommandHandler {
  constructor(public readonly historyService: HistoryService) {
  }

  canExecute(commandPath: string): boolean {
    if (commandPath === UNDO_COMMAND_ID) {
      return this.historyService.hasPrevious;
    } else if (commandPath === REDO_COMMAND_ID) {
      return this.historyService.hasNext;
    }

    return false;
  }

  executeCommand(commandPath: string): boolean {
    if (commandPath === UNDO_COMMAND_ID) {
      this.historyService.undo();
      return true;
    }

    if (commandPath === REDO_COMMAND_ID) {
      this.historyService.redo();
      return true;
    }

    return false;
  }


}

export function makeHistoryServiceCommands(): Command[] {
  return [
    {
      label: 'Undo',
      path: UNDO_COMMAND_ID,
      keyboardShortcuts: [['Ctrl', 'Z']],
    },
    {
      label: 'Redo',
      path: REDO_COMMAND_ID,
      keyboardShortcuts: [['Ctrl', 'Shift', 'Z'], ['Ctrl', 'Y']],
    },
  ];
}
