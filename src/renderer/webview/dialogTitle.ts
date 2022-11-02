import { ipcRenderer } from 'electron';

import {debug as debugFn} from '@common/preload-safe-debug'

const debug = debugFn(
  'Ferdium:Plugin:DialogTitleHandler',
);

export default class DialogTitleHandler {
  titleCache: { title: string };

  constructor() {
    this.titleCache = {
      title: '',
    };
  }

  safeGetTitle(title: string | undefined | null) {
    if (!title) {
      return '';
    }

    return title;
  }

  setDialogTitle(title: string | undefined | null) {
    const newTitle = this.safeGetTitle(title);
    if (this.titleCache.title === newTitle) {
      return;
    }

    debug('Sending active dialog title to host %s', newTitle);
    ipcRenderer.sendToHost('active-dialog-title', newTitle);

    this.titleCache.title = newTitle;
  }
}
