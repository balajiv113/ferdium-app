import {AuthInfo, BrowserWindow} from 'electron';
import {debug as debugFn} from '@common/preload-safe-debug';

const debug = debugFn(
  'Ferdium:feature:basicAuth:main',
);

export function mainIpcHandler(mainWindow: BrowserWindow, authInfo: AuthInfo) {
  debug('Sending basic auth call', authInfo);

  mainWindow.webContents.send('feature:basic-auth-request', {
    authInfo,
  });
}
