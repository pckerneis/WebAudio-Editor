import StoreBasedService from './helpers/StoreBasedService';
import {pluck} from 'rxjs';
import {BuiltAudioGraph, WebAudioGraphBuilder} from '../../builder/WebAudioGraphBuilder';
import PersistenceService from './PersistenceService';
import MessageService from './MessageService';

export default class PlayService extends StoreBasedService<PlayState> {
  private _currentAudioGraph: BuiltAudioGraph | null = null;

  public readonly playing$ = this.state$.pipe(
    pluck('playing'),
  );

  constructor(public readonly persistenceService: PersistenceService,
              public readonly messageService: MessageService) {
    super(defaultPlayState());
  }

  start(): void {
    const projectDocument = this.persistenceService.getState();
    const buildResult = new WebAudioGraphBuilder().build(projectDocument);

    if (buildResult.error) {
      this.messageService.post(buildResult.error.message, 'error');
    } else {
      this._currentAudioGraph = buildResult.audioGraph;
      this.commit(s => ({...s, playing: true}));
    }

  }

  stop(): void {
    if (this._currentAudioGraph != null) {
      this._currentAudioGraph.context.close().then(() => {
        this._currentAudioGraph = null;
      });

      this.commit(s => ({...s, playing: false}));
    }
  }
}

interface PlayState {
  playing: boolean;
}

function defaultPlayState(): PlayState {
  return {
    playing: false,
  };
}
