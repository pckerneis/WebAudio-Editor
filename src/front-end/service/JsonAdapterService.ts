import GraphService from './GraphService';
import ProjectService from './ProjectService';
import SelectedItemSet from '../utils/SelectedItemSet';
import {ProjectDocument} from '../../document/ProjectDocument';
import {isValidProjectDocument} from '../../document/validation/project-document-validation';
import MessageService from './MessageService';
import HistoryService from './HistoryService';

const DOC_VERSION = '0';

export default class JsonAdapterService {
  constructor(public readonly graphService: GraphService,
              public readonly projectService: ProjectService,
              public readonly graphSelection: SelectedItemSet<string>,
              public readonly messageService: MessageService,
              public readonly historyService: HistoryService) {
  }

  public getStateAsJsonString(): string {
    return JSON.stringify(this.getState());
  }

  public getState(): ProjectDocument {
    const {temporaryConnectionPort, ...graphState} = this.graphService.snapshot;
    const projectName = this.projectService.snapshot.projectName;

    return {
      projectName,
      audioGraph: graphState,
      docVersion: DOC_VERSION,
      selection: this.graphSelection.items,
    }
  }

  public loadFromJsonString(jsonString: string): void {
    try {
      const parsed = JSON.parse(jsonString);

      if (isValidProjectDocument(parsed)) {
        this.projectService.initialiseEmptyProject(parsed.projectName);
        this.graphSelection.setSelection(parsed.selection);
        this.graphService.loadState({
          ...parsed.audioGraph,
          temporaryConnectionPort: null,
        });
      } else {
        this.messageService.post('Invalid project document.', 'error');
      }
    } catch (e: any) {
      if (e?.message) {
        this.messageService.post('Could not load project:\n' + e?.message, 'error');
      } else {
        console.error(e);
      }
    }
  }
}
