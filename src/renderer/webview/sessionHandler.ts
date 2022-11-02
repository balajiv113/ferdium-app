import {debug as debugFn} from '@common/preload-safe-debug'

const debug = debugFn('Ferdium:Plugin:SessionHandler');

export default class SessionHandler {
  async releaseServiceWorkers() {
    try {
      const registrations =
        await window.navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        registration.unregister();
        debug('ServiceWorker unregistered');
      }
    } catch (error) {
      debug(error);
    }
  }
}
