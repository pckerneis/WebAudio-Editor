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
      .filter(([projectName, snapshots]) => Boolean(projectName) && Boolean(snapshots))
      .map(([projectName, snapshots]) => {
      const latestSnapshot = [...snapshots].pop();

      if (! latestSnapshot) {
        return null;
      }

      return {
        projectName,
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
    const projectName = this.projectService.snapshot.projectName as any;

    if (typeof projectName !== 'string' || projectName.length === 0) {
      console.warn(`Won't push snapshot because there's no project name`);
      return;
    }

    const record = this.getRecord();
    const knownSnapshots = record[projectName] ?? [];

    const newRecord: Record = {
      ...record,
      [projectName]: [...knownSnapshots, this.getSnapshot()],
    };

    LocaleStorageService.setRecord(newRecord);
  }

  private getSnapshot(): Snapshot {
    return {
      date: new Date(Date.now()).toISOString(),
      graphState: this.graphService.snapshot,
      selection: this.graphSelection.items,
      viewportOffset: this.layoutService.snapshot.viewportOffset,
    };
  }

  private static setRecord(records: Record): void {
    localStorage.setItem(LocaleStorageService.persistenceKey, JSON.stringify(records));
  }

  renameProject(value: string): void {
    const currentName = this.projectService.snapshot.projectName;
    const newName = value.trim();

    if (currentName === newName
      || newName.length === 0) {
      return;
    }

    const record = this.getRecord();

    if (record[newName] != null) {
      throw new Error(`A project named "${newName}" already exists.`);
    }

    const knownSnapshots = record[currentName] ?? [];
    const newRecord: Record = {
      ...record,
      [newName]: [...knownSnapshots, this.getSnapshot()],
      [currentName]: [],
    };

    LocaleStorageService.setRecord(newRecord);

    this.projectService.setProjectName(newName);
  }

  loadProject(info: ProjectInfo): void {
    const projectName = info.projectName;
    const record = this.getRecord();
    const snapshots = record[projectName];
    const latest = snapshots ? [...snapshots].pop() : null;

    if (latest) {
      this.graphService.loadState(latest.graphState);
      this.graphSelection.setSelection(latest.selection);
      this.projectService.setProjectName(projectName);
      this.layoutService.setViewportTranslate(latest.viewportOffset);
      this.historyService.setSavePoint();
    }
  }
}

interface Record {
  [projectName: string]: Snapshot[];
}

interface Snapshot {
  graphState: GraphState;
  selection: string[];
  date: string;
  name?: string | null;
  viewportOffset: Coordinates;
}

export interface ProjectInfo {
  projectName: string;
  lastModification: Date;
}
