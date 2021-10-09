import {GraphState} from '../state/GraphState';
import GraphService from './GraphService';
import SelectedItemSet from '../utils/SelectedItemSet';
import {map} from 'rxjs';
import SequenceGenerator from '../utils/SequenceGenerator';
import StoreBasedService from './helpers/StoreBasedService';
import Coordinates from '../../document/models/Coordinates';
import LayoutService from './LayoutService';

export default class HistoryService extends StoreBasedService<HistoryState> {
  private readonly sequenceGenerator = new SequenceGenerator();

  public readonly current$ = this.state$.pipe(
    map(s => s.transactions[s.currentIndex]),
  );

  constructor(public readonly graphService: GraphService,
              public readonly graphSelection: SelectedItemSet<string>,
              public readonly layoutService: LayoutService) {
    super(emptyHistory());
  }

  public get hasPrevious(): boolean {
    return this.snapshot.currentIndex > 0;
  }

  public get hasNext(): boolean {
    return this.snapshot.currentIndex + 1 < this.snapshot.transactions.length;
  }

  get undoDescription(): string | null {
    if (this.snapshot.currentIndex === 0) {
      return null;
    }

    const current = this.currentTransaction;

    if (current) {
      const when = current.date.toLocaleTimeString();
      return `Undo ${current.description} (${when})`;
    } else {
      return null;
    }
  }

  get redoDescription(): string | null {
    const next = this.nextTransaction;

    if (next) {
      const when = next.date.toLocaleTimeString();
      return `Redo ${next.description} (${when})`;
    } else {
      return null;
    }
  }

  public clearHistory(): void {
    this.commit(emptyHistory());
  }

  public setSavePoint(): void {
    this.commit(emptyHistory());
    this.pushTransaction('initial state');
  }

  public pushTransaction(description: string): void {
    const newTransaction: Transaction = {
      id: this.sequenceGenerator.nextString(),
      description,
      graphState: this.graphService.snapshot,
      selection: this.graphSelection.items,
      date: new Date(Date.now()),
      viewportOffset: this.layoutService.snapshot.viewportOffset,
    };

    const transactions = [
      ...this.snapshot.transactions.slice(0, this.snapshot.currentIndex + 1),
      newTransaction,
    ];

    const newState: HistoryState = {
      transactions,
      currentIndex: this.snapshot.currentIndex + 1,
    };

    this.commit(newState);
  }

  public undo(): void {
    if (this.hasPrevious) {
      const newIndex = this.snapshot.currentIndex - 1;
      const restoredState = this.snapshot.transactions[newIndex];

      this.graphService.loadState(restoredState.graphState);
      this.graphSelection.setSelection(restoredState.selection);

      this.commit(s => ({...s, currentIndex: newIndex}));
    }
  }

  public redo(): void {
    if (this.hasNext) {
      const newIndex = this.snapshot.currentIndex + 1;
      const restoredState = this.snapshot.transactions[newIndex];

      this.graphService.loadState(restoredState.graphState);
      this.graphSelection.setSelection(restoredState.selection);

      this.graphService.loadState(restoredState.graphState);
      this.graphSelection.setSelection(restoredState.selection);

      this.commit(s => ({...s, currentIndex: newIndex}));
    }
  }

  private get currentTransaction(): Transaction | null {
    const {currentIndex, transactions} = this.snapshot;
    return transactions[currentIndex];
  }

  private get nextTransaction(): Transaction | null {
    if (!this.hasNext) {
      return null;
    }

    const {currentIndex, transactions} = this.snapshot;
    return transactions[currentIndex + 1];
  }
}

export interface HistoryState {
  transactions: Transaction[];
  currentIndex: number;
}

export function emptyHistory(): HistoryState {
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
  date: Date;
  viewportOffset: Coordinates;
}

export enum TransactionNames {
  MOVE_SELECTION = 'move selection',

  CREATE_NODE = 'create node',
  CREATE_CONNECTION = 'create connection',
  CREATE_DYNAMIC_SECTION = 'create dynamic section',

  DELETE_SELECTION = 'delete selection',

  SET_NODE_NAME = 'set node name',
  SET_NODE_PARAM = 'set node param',
}
