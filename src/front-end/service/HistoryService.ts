import {GraphState} from '../state/GraphState';
import GraphService from './GraphService';
import SelectedItemSet from '../utils/SelectedItemSet';
import {BehaviorSubject} from 'rxjs';
import SequenceGenerator from '../utils/SequenceGenerator';

export default class HistoryService {

  private readonly sequenceGenerator = new SequenceGenerator();

  private _store = new BehaviorSubject<History>(emptyHistory());

  public readonly state$ = this._store.asObservable();

  constructor(public readonly graphService: GraphService,
              public readonly graphSelection: SelectedItemSet<string>) {
  }

  public get state(): History {
    return this._store.value;
  }

  public get canUndo(): boolean {
    return this.state.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.state.redoStack.length > 0;
  }

  public pushHistory(description: string): void {
    const newItem: HistoryState = {
      id: this.sequenceGenerator.nextString(),
      description,
      graphState: this.graphService.snapshot,
      selection: this.graphSelection.items,
    };

    const newState = {
      undoStack: [...this.state.undoStack, newItem],
      redoStack: [],
    };

    this._store.next(newState);
  }

  public undo(): void {
    if (this.canUndo) {
      const undoStack = [...this.state.undoStack];
      const restoredState = undoStack.pop() as HistoryState;

      this._store.next({
        undoStack,
        redoStack: [...this.state.redoStack, restoredState],
      });
    }
  }

  public redo(): void {
    if (this.canRedo) {
      const redoStack = [...this.state.redoStack];
      const restoredState = redoStack.pop() as HistoryState;

      this._store.next({
        undoStack: [...this.state.undoStack, restoredState],
        redoStack,
      });
    }
  }
}

export interface History {
  undoStack: HistoryState[];
  redoStack: HistoryState[];
}

function emptyHistory(): History {
  return {
    undoStack: [],
    redoStack: [],
  };
}

interface HistoryState {
  id: string;
  description: string;
  graphState: GraphState;
  selection: string[];
}
