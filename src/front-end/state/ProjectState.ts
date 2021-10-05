export const DEFAULT_PROJECT_NAME = 'Untitled audio graph';

export interface ProjectState {
  projectName: string;
}

export function getInitialProjectState(): ProjectState {
  return {
    projectName: DEFAULT_PROJECT_NAME,
  }
}
