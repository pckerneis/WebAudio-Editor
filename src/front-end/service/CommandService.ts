export interface RegisteredCommand extends Command {
  disabled: boolean;
}

export default class CommandService {
  private _handlers: CommandHandler[] = [];

  constructor(private readonly commands: Command[]) {
  }

  get registeredCommands(): RegisteredCommand[] {
    return this.commands.map(cmd => ({
      ...cmd,
      disabled: ! this._handlers.some(handler => handler.canExecute(cmd.path)),
    }))
  }

  executeCommand(commandPath: string): void {
    for (const handler of this._handlers) {
      if (handler.executeCommand(commandPath)) {
        return;
      }
    }
  }

  registerCommandHandlers(...handlers: CommandHandler[]) {
    this._handlers.push(...handlers);
  }
}

export interface CommandHandler {
  canExecute(commandPath: string): boolean;
  executeCommand(commandPath: string): boolean;
}

export interface Command {
  label: string;
  path: string;
  keyboardShortcuts?: string[][];
}
