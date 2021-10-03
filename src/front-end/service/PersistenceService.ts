import GraphService from './GraphService';
import ProjectService from './ProjectService';
import SelectedItemSet from '../utils/SelectedItemSet';
import {ProjectDocument} from '../../document/ProjectDocument';
import {isValidProjectDocument} from '../../document/validation/project-document-validation';

const DOC_VERSION = '0';

export default class PersistenceService {
  constructor(public readonly graphService: GraphService,
              public readonly projectService: ProjectService,
              public readonly graphSelection: SelectedItemSet<string>) {
  }

  getStateAsJsonString(): string {
    return JSON.stringify(this.getState());
  }

  private getState(): ProjectDocument {
    const {temporaryConnectionPort, ...graphState} = this.graphService.snapshot;
    const projectName = this.projectService.snapshot.projectName;

    return {
      projectName,
      audioGraph: graphState,
      docVersion: DOC_VERSION,
      selection: this.graphSelection.items,
    }
  }

  loadFromJsonString(jsonString: string): void {
    try{
      const parsed = JSON.parse(jsonString);

      if (isValidProjectDocument(parsed)) {
        this.projectService.setProjectName(parsed.projectName);
        this.graphSelection.setSelection(parsed.selection);
        this.graphService.loadState({
          ...parsed.audioGraph,
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
