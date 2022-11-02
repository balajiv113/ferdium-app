import { state } from './store';

export { default as Component } from './Component';

import {debug as debugFn} from '@common/preload-safe-debug'

const debug = debugFn(
  'Ferdium:feature:publishDebugInfo',
);

export default function initialize(): void {
  debug('Initialize publishDebugInfo feature');

  const showModal = (): void => {
    state.isModalVisible = true;
  };

  window['ferdium'].features.publishDebugInfo = { state, showModal };
}
