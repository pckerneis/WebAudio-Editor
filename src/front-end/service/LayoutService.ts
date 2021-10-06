import StoreBasedService from './helpers/StoreBasedService';
import {combineLatest, map, Observable, pluck} from 'rxjs';
import {anyTruthy} from '../utils/arrays';
import Coordinates, {emptyCoordinates} from '../../document/models/Coordinates';
import {translateViewport} from './actions/ViewportCommands';

export default class LayoutService extends StoreBasedService<Layout> {
  public readonly isCommandPaletteVisible$: Observable<boolean>;
  public readonly isOpenProjectVisible$: Observable<boolean>;

  public readonly hasModalWindow$: Observable<boolean>;

  constructor() {
    super(emptyLayout());

    this.isCommandPaletteVisible$ = this.state$.pipe(pluck('isCommandPaletteVisible'));
    this.isOpenProjectVisible$ = this.state$.pipe(pluck('isOpenProjectVisible'));
    this.hasModalWindow$ = combineLatest([
      this.isCommandPaletteVisible$,
      this.isOpenProjectVisible$,
    ]).pipe(map(anyTruthy));
  }

  setViewportTranslate(coordinates: Coordinates): void {
    this.commit(s => translateViewport(coordinates, s));
  }

  showCommandPalette(): void {
    this.commit(s => ({...s, isCommandPaletteVisible: true}));
  }

  closeCommandPalette(): void {
    this.commit(s => ({...s, isCommandPaletteVisible: false}));
  }

  showOpenProject(): void {
    this.commit(s => ({...s, isOpenProjectVisible: true}));
  }

  closeOpenProject(): void {
    this.commit(s => ({...s, isOpenProjectVisible: false}));
  }
}

export interface Layout {
  viewportOffset: Coordinates;
  isCommandPaletteVisible: boolean;
  isOpenProjectVisible: boolean;
}

export function emptyLayout(): Layout {
  return {
    viewportOffset: emptyCoordinates(),
    isOpenProjectVisible: false,
    isCommandPaletteVisible: false,
  };
}
