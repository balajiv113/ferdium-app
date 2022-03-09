import { ipcRenderer } from 'electron';
import { ThemeType } from '@meetfranz/theme';
import {
  computed,
  action,
  observable,
} from 'mobx';
import localStorage from 'mobx-localstorage';

import { webContents } from '@electron/remote';
import { todoActions } from './actions';
import { FeatureStore } from '../utils/FeatureStore';
import { createReactions } from '../../stores/lib/Reaction';
import { createActionBindings } from '../utils/ActionBinding';
import {
  DEFAULT_TODOS_WIDTH, TODOS_MIN_WIDTH, DEFAULT_TODOS_VISIBLE, TODOS_ROUTES, DEFAULT_IS_FEATURE_ENABLED_BY_USER,
} from '.';
import { IPC } from './constants';
import { state as delayAppState } from '../delayApp';

const debug = require('debug')('Franz:feature:todos:store');

export default class TodoStore extends FeatureStore {
  @observable isFeatureEnabled = false;

  @observable isFeatureActive = false;

  @observable webContentsId = null;

  isInitialized = false;

  @computed get width() {
    const width = this.settings.width || DEFAULT_TODOS_WIDTH;

    return width < TODOS_MIN_WIDTH ? TODOS_MIN_WIDTH : width;
  }

  @computed get isTodosPanelForceHidden() {
    const { isAnnouncementShown } = this.stores.announcements;
    return delayAppState.isDelayAppScreenVisible || !this.isFeatureEnabledByUser || isAnnouncementShown;
  }

  @computed get isTodosPanelVisible() {
    if (this.settings.isTodosPanelVisible === undefined) return DEFAULT_TODOS_VISIBLE;
    return this.settings.isTodosPanelVisible;
  }

  @computed get isFeatureEnabledByUser() {
    return this.settings.isFeatureEnabledByUser;
  }

  @computed get settings() {
    return localStorage.getItem('todos') || {};
  }

  @computed get webContents() {
    if (!this.webContentsId) return null;

    return webContents.fromId(this.webContentsId);
  }

  // ========== PUBLIC API ========= //

  @action start(stores, actions) {
    debug('TodoStore::start');
    this.stores = stores;
    this.actions = actions;

    // ACTIONS

    this._registerActions(createActionBindings([
      [todoActions.resize, this._resize],
      [todoActions.toggleTodosPanel, this._toggleTodosPanel],
      [todoActions.handleHostMessage, this._handleHostMessage],
      [todoActions.handleClientMessage, this._handleClientMessage],
      [todoActions.toggleTodosFeatureVisibility, this._toggleTodosFeatureVisibility],
      [todoActions.openDevTools, this._openDevTools],
      [todoActions.reload, this._reload],
    ]));

    // REACTIONS

    this._allReactions = createReactions([
      this._setFeatureEnabledReaction,
      this._updateTodosConfig,
      this._firstLaunchReaction,
      this._routeCheckReaction,
    ]);

    this._registerReactions(this._allReactions);

    this.isFeatureActive = true;

    if (this.settings.isFeatureEnabledByUser === undefined) {
      this._updateSettings({
        isFeatureEnabledByUser: DEFAULT_IS_FEATURE_ENABLED_BY_USER,
      });
    }

    ipcRenderer.on(IPC.TODOS_HOST_CHANNEL, (e, message) => {
      console.log('todos, host', e, message);
      this._handleHostMessage(message);
    });

    ipcRenderer.on(IPC.TODOS_CLIENT_CHANNEL, (e, message) => {
      this.webContentsId = e.senderId;
      console.log('todos, client', message);
      this._handleClientMessage({ channel: 'todos', message });
    });
  }

  @action stop() {
    super.stop();
    debug('TodoStore::stop');
    this.reset();
    this.isFeatureActive = false;
  }

  // ========== PRIVATE METHODS ========= //

  _updateSettings = (changes) => {
    localStorage.setItem('todos', {
      ...this.settings,
      ...changes,
    });
  };

  // Actions

  @action _resize = ({ width }) => {
    this._updateSettings({
      width,
    });
  };

  @action _toggleTodosPanel = () => {
    this._updateSettings({
      isTodosPanelVisible: !this.isTodosPanelVisible,
    });
  };

  @action _handleHostMessage = (message) => {
    debug('_handleHostMessage', message, message.action === 'todos:create');
    if (message.action === 'todos:create') {
      this.webContents.send(IPC.TODOS_HOST_CHANNEL, message);
    }
  };

  @action _handleClientMessage = ({ channel, message = {} }) => {
    debug('_handleClientMessage', channel, message);
    switch (message.action) {
      case 'todos:initialized': this._onTodosClientInitialized(); break;
      case 'todos:goToService': this._goToService(message.data); break;
      // case 'todos:create': this._goToService(message.data); break;
      default:
        debug('Other message received', channel, message);
        console.log('this.stores.services.isTodosServiceAdded', this.stores.services.isTodosServiceAdded);
        if (this.stores.services.isTodosServiceAdded) {
          this.actions.service.handleIPCMessage({
            serviceId: this.stores.services.isTodosServiceAdded.id,
            channel,
            args: message,
          });
        }
    }
  };

  @action _toggleTodosFeatureVisibility = () => {
    debug('_toggleTodosFeatureVisibility');

    this._updateSettings({
      isFeatureEnabledByUser: !this.settings.isFeatureEnabledByUser,
    });
  };

  _openDevTools = () => {
    debug('_openDevTools');

    const webview = document.querySelector('#todos-panel webview');
    if (webview) webview.openDevTools({ mode: 'detach' });
  }

  _reload = () => {
    debug('_reload');

    const webview = document.querySelector('#todos-panel webview');
    if (webview) webview.reload();
  }

  // Todos client message handlers

  _onTodosClientInitialized = async () => {
    const { authToken } = this.stores.user;
    const { isDarkThemeActive } = this.stores.ui;
    const { locale } = this.stores.app;
    if (!this.webContents) return;
    await this.webContents.send(IPC.TODOS_HOST_CHANNEL, {
      action: 'todos:configure',
      data: {
        authToken,
        locale,
        theme: isDarkThemeActive ? ThemeType.dark : ThemeType.default,
      },
    });

    if (!this.isInitialized) {
      this.isInitialized = true;
    }
  };

  _goToService = ({ url, serviceId }) => {
    if (url) {
      const service = this.stores.services.one(serviceId);

      if (service) {
        service.webContents.loadURL(url);
      }

      this.actions.service.setActive({ serviceId });
    }
  };

  // Reactions

  _setFeatureEnabledReaction = () => {
    const { isTodosEnabled } = this.stores.features.features;

    this.isFeatureEnabled = isTodosEnabled;
  };

  _updateTodosConfig = () => {
    // Resend the config if any part changes in Franz:
    this._onTodosClientInitialized();
  };

  _firstLaunchReaction = () => {
    const { stats } = this.stores.settings.all;

    // Hide todos layer on first app start but show on second
    if (stats.appStarts <= 1) {
      this._updateSettings({
        isTodosPanelVisible: false,
      });
    } else if (stats.appStarts <= 2) {
      this._updateSettings({
        isTodosPanelVisible: true,
      });
    }
  };

  _routeCheckReaction = () => {
    const { pathname } = this.stores.router.location;

    if (pathname === TODOS_ROUTES.TARGET) {
      debug('Router is on todos route, show todos panel');
      // todosStore.start(stores, actions);
      this.stores.router.push('/');

      if (!this.isTodosPanelVisible) {
        this._updateSettings({
          isTodosPanelVisible: true,
        });
      }
    }
  }
}
