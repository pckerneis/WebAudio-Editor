import GraphService from './GraphService';
import {GraphState} from '../state/GraphState';
import ProjectService from './ProjectService';
import SelectedItemSet from '../utils/SelectedItemSet';

const APP_VERSION = '0.0.1';

export default class PersistenceService {
  constructor(public readonly graphService: GraphService,
              public readonly projectService: ProjectService,
              public readonly graphSelection: SelectedItemSet<string>) {
  }

  getStateAsJsonString(): string {
    console.log('Saving state', this.getState());
    return JSON.stringify(this.getState());
  }

  private getState(): ProjectState {
    const {temporaryConnectionPort, ...graphState} = this.graphService.snapshot;
    const projectName = this.projectService.snapshot.projectName;

    return {
      projectName,
      graphState,
      appVersion: APP_VERSION,
      selection: this.graphSelection.items,
    }
  }

  loadFromJsonString(jsonString: string): void {
    try{
      const parsed = JSON.parse(jsonString);

      if (isValidProjectState(parsed)) {
        if (typeof parsed.graphState === 'object') {
          this.graphService.loadState(parsed.graphState);
        }

        if (typeof parsed.projectName === 'string') {
          this.projectService.setProjectName(parsed.projectName);
        }

        if (Array.isArray(parsed.selection)) {
          this.graphSelection.setSelection(parsed.selection);
        }
      } else {
        console.error('Invalid project state.');
      }
    } catch(e) {
      console.error(e);
    }
  }
}

interface ProjectState {
  projectName: string;
  appVersion: string;
  graphState: Omit<GraphState, 'temporaryConnectionPort'>;
  selection: string[];
}

function isValidProjectState(parsed: any): boolean {
  // TODO
  return true;
}
