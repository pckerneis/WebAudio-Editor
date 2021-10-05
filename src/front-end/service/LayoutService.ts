import StoreBasedService from './helpers/StoreBasedService';

export default class LayoutService extends StoreBasedService<Layout> {
  constructor() {
    super(emptyLayout());
  }

  openPreviewFrame(): void {
    this.commit(s => ({ ...s, previewVisible: true }));
  }

  closePreviewFrame(): void {
    this.commit(s => ({ ...s, previewVisible: false }));
  }
}

export interface Layout {
  previewVisible: boolean;
}

export function emptyLayout(): Layout {
  return {
    previewVisible: false,
  };
}
