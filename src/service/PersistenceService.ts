import GraphService from './GraphService';
import ProjectService from './ProjectService';
import SelectedItemSet from '../utils/SelectedItemSet';
import {isValidPersistedProjectState, PersistedProjectState} from '../persistence/PersistedProjectState';

const DOC_VERSION = '0';

export default class PersistenceService {
  constructor(public readonly graphService: GraphService,
              public readonly projectService: ProjectService,
              public readonly graphSelection: SelectedItemSet<string>) {
  }

  getStateAsJsonString(): string {
    return JSON.stringify(this.getState());
  }

  private getState(): PersistedProjectState {
    const {temporaryConnectionPort, ...graphState} = this.graphService.snapshot;
    const projectName = this.projectService.snapshot.projectName;

    return {
      projectName,
      graphState,
      docVersion: DOC_VERSION,
      selection: this.graphSelection.items,
    }
  }

  loadFromJsonString(jsonString: string): void {
    try{
      const parsed = JSON.parse(jsonString);

      if (isValidPersistedProjectState(parsed)) {
        this.projectService.setProjectName(parsed.projectName);
        this.graphSelection.setSelection(parsed.selection);
        this.graphService.loadState({
          ...parsed.graphState,
          temporaryConnectionPort: null,
        });
      } else {
        console.error('Invalid project state.');
      }
    } catch(e) {
      console.error(e);
    }
  }
}
