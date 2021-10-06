export const DEFAULT_PROJECT_NAME = '';

export interface ProjectState {
  projectId: string | null;
  projectName: string;
  creation?: Date;
  lastModification?: Date;
}

export function getEmptyProjectState(): ProjectState {
  return {
    projectId: null,
    projectName: '',
  }
}
