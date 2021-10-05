import {BehaviorSubject, Observable} from 'rxjs';

export default abstract class StoreBasedService<S> {
  protected readonly _store: BehaviorSubject<S>;
  public readonly state$: Observable<S>;

  constructor(defaultState: S) {
    this._store = new BehaviorSubject<S>(defaultState);
    this.state$ = this._store.asObservable();
  }

  public get snapshot(): S {
    return this._store.value;
  }

  protected commit(mapper: StateMapper<S>): void {
    return this._store.next(mapper(this.snapshot));
  }
}

type StateMapper<S> = (s: S) => S;
