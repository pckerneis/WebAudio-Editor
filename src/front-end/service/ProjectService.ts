import {DEFAULT_PROJECT_NAME, getEmptyProjectState, newProjectId, ProjectState} from '../state/ProjectState';
import StoreBasedService from './helpers/StoreBasedService';

export default class ProjectService extends StoreBasedService<ProjectState> {
  constructor() {
    super(getEmptyProjectState());
  }

  restoreProject(projectId: string, projectName: string): void {
    this.commit(s => ({
      ...s,
      projectId,
      projectName,
    }));
  }

  renameProject(projectName: string): void {
    this.commit(s => ({
      ...s,
      projectName,
    }));
  }

  initialiseEmptyProject(projectName?: string): void {
    this.commit({
      projectId: newProjectId(),
      creation: new Date(Date.now()),
      projectName: projectName || DEFAULT_PROJECT_NAME,
    });
  }
}
