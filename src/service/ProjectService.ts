import {BehaviorSubject, Observable} from 'rxjs';
import {getInitialProjectState, ProjectState} from '../state/ProjectState';

export default class ProjectService {
  public readonly state$: Observable<ProjectState>;

  private _store = new BehaviorSubject<ProjectState>(getInitialProjectState());

  constructor() {
    this.state$ = this._store.asObservable();
  }

  get snapshot(): ProjectState {
    return this._store.value;
  }

  setProjectName(projectName: string): void {
    this._store.next({
      ...this.snapshot,
      projectName,
    });
  }
}
