import {GraphState} from '../state/GraphState';
import GraphService from './GraphService';
import SelectedItemSet from '../utils/SelectedItemSet';
import {BehaviorSubject, map} from 'rxjs';
import SequenceGenerator from '../utils/SequenceGenerator';

export default class HistoryService {

  private readonly sequenceGenerator = new SequenceGenerator();

  private _store = new BehaviorSubject<History>(emptyHistory());

  public readonly current$ = this._store.pipe(
    map(s => s.transactions[s.currentIndex]),
  );

  constructor(public readonly graphService: GraphService,
              public readonly graphSelection: SelectedItemSet<string>) {
  }

  public get state(): History {
    return this._store.value;
  }

  public get hasPrevious(): boolean {
    return this.state.currentIndex > 0;
  }

  public get hasNext(): boolean {
    return this.state.currentIndex + 1 < this.state.transactions.length;
  }

  get previousDescription(): string | null {
    const previous = this.previousTransaction;

    if (previous) {
      return `Undo ${previous.description}`;
    } else {
      return null;
    }
  }

  get nextDescription(): string | null {
    const next = this.nextTransaction;

    if (next) {
      return `Redo ${next.description}`;
    } else {
      return null;
    }
  }

  public clearHistory(): void {
    this._store.next(emptyHistory());
  }

  public pushTransaction(description: string): void {
    const newTransaction: Transaction = {
      id: this.sequenceGenerator.nextString(),
      description,
      graphState: this.graphService.snapshot,
      selection: this.graphSelection.items,
    };

    const transactions = [
      ...this.state.transactions.slice(0, this.state.currentIndex + 1),
      newTransaction,
    ];

    const newState: History = {
      transactions,
      currentIndex: this.state.currentIndex + 1,
    };

    this._store.next(newState);
  }

  public previous(): void {
    if (this.hasPrevious) {
      const newIndex = this.state.currentIndex - 1;
      const restoredState = this.state.transactions[newIndex];

      this.graphService.loadState(restoredState.graphState);
      this.graphSelection.setSelection(restoredState.selection);

      this._store.next({
        ...this.state,
        currentIndex: newIndex,
      });
    }
  }

  public next(): void {
    if (this.hasNext) {
      const newIndex = this.state.currentIndex + 1;
      const restoredState = this.state.transactions[newIndex];

      this.graphService.loadState(restoredState.graphState);
      this.graphSelection.setSelection(restoredState.selection);

      this.graphService.loadState(restoredState.graphState);
      this.graphSelection.setSelection(restoredState.selection);

      this._store.next({
        ...this.state,
        currentIndex: newIndex,
      });
    }
  }

  private get previousTransaction(): Transaction | null {
    if (!this.hasPrevious) {
      return null;
    }

    const {currentIndex, transactions} = this.state;
    return transactions[currentIndex - 1];
  }

  private get nextTransaction(): Transaction | null {
    if (!this.hasNext) {
      return null;
    }

    const {currentIndex, transactions} = this.state;
    return transactions[currentIndex + 1];
  }
}

export interface History {
  transactions: Transaction[];
  currentIndex: number;
}

export function emptyHistory(): History {
  return {
    transactions: [],
    currentIndex: -1,
  };
}

interface Transaction {
  id: string;
  description: string;
  graphState: GraphState;
  selection: string[];
}
