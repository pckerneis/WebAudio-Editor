export default class CommandService {
  private _handlers: CommandHandler[] = [];

  constructor(public readonly commands: Command[]) {
  }

  executeCommand(commandPath: string): void {
    for (const handler of this._handlers) {
      if (handler.executeCommand(commandPath)) {
        return;
      }
    }
  }

  registerCommandHandler(handler: CommandHandler) {
    this._handlers.push(handler);
  }
}

export interface CommandHandler {
  executeCommand(commandPath: string): boolean;
}

export interface Command {
  label: string;
  path: string;
  description: string;
}
