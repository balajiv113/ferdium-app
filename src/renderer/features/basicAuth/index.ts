import { ipcRenderer } from 'electron';

import { state as ModalState } from './store';

import {debug as debugFn} from '@common/preload-safe-debug'

const debug = debugFn('Ferdium:feature:basicAuth');

const state = ModalState;

export default function initialize() {
  debug('Initialize basicAuth feature');

  window['ferdium'].features.basicAuth = {
    state,
  };

  ipcRenderer.on('feature:basic-auth-request', (e, data) => {
    debug(e, data);
    // state.serviceId = data.serviceId;
    state.authInfo = data.authInfo;
    state.isModalVisible = true;
  });
}

export { default as Component } from './Component';
