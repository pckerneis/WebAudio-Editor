import ProjectService from './ProjectService';
import {GraphState} from '../state/GraphState';
import GraphService from './GraphService';
import SelectedItemSet from '../utils/SelectedItemSet';
import LayoutService from './LayoutService';
import Coordinates from '../../document/models/Coordinates';
import HistoryService from './HistoryService';

export default class LocaleStorageService {

  constructor(public readonly graphService: GraphService,
              public readonly graphSelection: SelectedItemSet<string>,
              public readonly projectService: ProjectService,
              public readonly layoutService: LayoutService,
              public readonly historyService: HistoryService) {
  }

  private static persistenceKey = 'WebAudio-Editor_projectData_0';

  public getRecord(): Record {
    const stored = localStorage.getItem(LocaleStorageService.persistenceKey);

    if (stored == null) {
      return {};
    }

    return JSON.parse(stored);
  }

  public findLatestProject(): ProjectInfo {
    const knownProjects = this.getKnownProjectInfos();
    return knownProjects[0];
  }

  public getKnownProjectInfos(): ProjectInfo[] {
    const record = this.getRecord();
    const lines = Object.entries(record)
      .filter(([projectId, snapshots]) => Boolean(projectId) && Boolean(snapshots))
      .map(([projectId, snapshots]) => {
      const latestSnapshot = [...snapshots].pop();

      if (! latestSnapshot) {
        return null;
      }

      return {
        projectId,
        projectName: latestSnapshot.projectName,
        lastModification: new Date(Date.parse(latestSnapshot.date)),
      };
    }).filter(Boolean) as ProjectInfo[];

    // Sort latest first
    lines.sort((first, second) => {
      return second.lastModification.getTime() - first.lastModification.getTime();
    });

    return lines;
  }

  public pushSnapshot(): void {
    const projectId = this.projectService.snapshot.projectId as any;

    if (typeof projectId !== 'string' || projectId.length === 0) {
      console.warn(`Project ID is not defined!`);
      return;
    }

    const record = this.getRecord();
    const knownSnapshots = record[projectId] ?? [];

    const newRecord: Record = {
      ...record,
      [projectId]: [...knownSnapshots, this.getSnapshot()],
    };

    LocaleStorageService.setRecord(newRecord);
  }

  private getSnapshot(): Snapshot {
    return {
      date: new Date(Date.now()).toISOString(),
      graphState: this.graphService.snapshot,
      selection: this.graphSelection.items,
      viewportOffset: this.layoutService.snapshot.viewportOffset,
      projectName: this.projectService.snapshot.projectName,
    };
  }

  private static setRecord(records: Record): void {
    localStorage.setItem(LocaleStorageService.persistenceKey, JSON.stringify(records));
  }

  loadProject(info: ProjectInfo): void {
    const projectId = info.projectId;
    const record = this.getRecord();
    const snapshots = record[projectId];
    const latest = snapshots ? [...snapshots].pop() : null;

    if (latest) {
      this.graphService.loadState(latest.graphState);
      this.graphSelection.setSelection(latest.selection);
      this.projectService.restoreProject(projectId, info.projectName);
      this.layoutService.setViewportTranslate(latest.viewportOffset);
      this.historyService.setSavePoint();
    }
  }
}

interface Record {
  [projectName: string]: Snapshot[];
}

interface Snapshot {
  projectName: string;
  graphState: GraphState;
  selection: string[];
  date: string;
  viewportOffset: Coordinates;
}

export interface ProjectInfo {
  projectId: string;
  projectName: string;
  lastModification: Date;
}
