import {BehaviorSubject} from 'rxjs';

export default class SelectedItemSet<T> {
  private _selection = new BehaviorSubject<T[]>([]);

  public readonly selection$ = this._selection.asObservable();

  get items(): T[] {
    return this._selection.value;
  }

  get length() {
    return this.items.length;
  }

  selectOnMouseDown(item: T, event: MouseEvent): void {
    const itemIsSelected = this.isSelected(item);

    if (SelectedItemSet.hasAddModifier(event)) {
      if (!itemIsSelected) {
        this.addToSelection(item);
      }
    } else if (SelectedItemSet.hasToggleModifier(event)) {
      if (!itemIsSelected) {
        this.addToSelection(item);
      } else {
        this.removeFromSelection(item);
      }
    } else {
      if (!itemIsSelected) {
        this.setUniqueSelection(item);
      }
    }
  }

  isSelectionEmpty(): boolean {
    return this.items.length === 0;
  }

  selectOnMouseUp(item: T, event: MouseEvent): void {
    if (SelectedItemSet.hasAddModifier(event)) {
      this.addToSelection(item);
    } else if (SelectedItemSet.hasToggleModifier(event)) {

    } else {
      this.setUniqueSelection(item);
    }
  }

  setUniqueSelection(item: T): void {
    this.clearSelection();
    this.addToSelection(item);
  }

  isSelected(item: T): boolean {
    return this.items.indexOf(item) >= 0;
  }

  clearSelection(): void {
    this._selection.next([]);
  }

  addToSelection(item: T): void {
    if (!this.isSelected(item)) {
      this.push(item);
    }
  }

  private push(item: T): void {
    this._selection.next([...this.items, item]);
  }

  removeFromSelection(...items: T[]): void {
    this._selection.next(this.items.filter((t) => ! items.includes(t)));
  }

  private static hasAddModifier(e: MouseEvent): boolean {
    return e.metaKey || e.shiftKey;
  }

  private static hasToggleModifier(e: MouseEvent): boolean {
    return e.ctrlKey;
  }

  setSelection(selection: T[]): void {
    this._selection.next(selection);
  }
}
