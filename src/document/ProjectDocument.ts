import {AudioGraphModel} from './models/AudioGraphModel';

export const KNOWN_DOC_VERSIONS = ['0'];

export interface ProjectDocument {
  projectName: string;
  docVersion: string;
  audioGraph: AudioGraphModel;
  selection: string[];
}
