import {getInitialProjectState, ProjectState} from '../state/ProjectState';
import StoreBasedService from './helpers/StoreBasedService';

export default class ProjectService extends StoreBasedService<ProjectState> {
  constructor() {
    super(getInitialProjectState());
  }

  setProjectName(projectName: string): void {
    this.commit(s => ({...s, projectName}));
  }
}
