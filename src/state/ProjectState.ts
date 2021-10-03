export interface ProjectState {
  projectName: string;
}

export function getInitialProjectState(): ProjectState {
  return {
    projectName: 'Untitled audio graph',
  }
}
