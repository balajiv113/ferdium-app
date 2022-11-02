import { state as ModalState } from './store';

export { default as Component } from './Component';
const state = ModalState;

import {debug as debugFn} from '@common/preload-safe-debug'

const debug = debugFn(
  'Ferdium:feature:quickSwitch',
);

export default function initialize() {
  debug('Initialize quickSwitch feature');

  function showModal() {
    state.isModalVisible = true;
  }

  window['ferdium'].features.quickSwitch = {
    state,
    showModal,
  };
}
