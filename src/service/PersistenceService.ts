import GraphService from './GraphService';
import {GraphState} from '../state/GraphState';

export default class PersistenceService {
  constructor(public readonly graphService: GraphService) {
  }

  getStateAsJsonString(): string {
    console.log('Saving state', this.getState());
    return JSON.stringify(this.getState());
  }

  private getState(): ProjectState {
    const {temporaryConnectionPort, ...graphState} = this.graphService.snapshot;

    return {
      graphState,
    }
  }

  loadFromJsonString(jsonString: string): void {
    try{
      const parsed = JSON.parse(jsonString);

      if (isValidProjectState(parsed)) {
        if (typeof parsed.graphState === 'object') {
          this.graphService.loadState(parsed.graphState);
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
  graphState: Omit<GraphState, 'temporaryConnectionPort'>;
}

function isValidProjectState(parsed: any): boolean {
  // TODO
  return true;
}
