import { RuntimeError } from '@/errors';
import { SettingService } from './services';
import Updater from './modules/Updater';
import browser from '@/modules/Extension/browser';
import defaultSettings from '@/config/default';
import ServiceProvider from './services/ServiceProvider';
import updateSettings from '@/config/update';
import updates from './updates';

class Application {
  /**
   * @type {Application}
   */
  static instance;

  /**
   * @type {Map<string, any>}
   */
  serviceContainer;

  /**
   * @type {object} Application settings
   */
  settings;

  /**
   * @constructor
   */
  constructor() {
    if (Application.instance) {
      throw new RuntimeError('There\'s already a application instance.');
    }

    this.serviceContainer = new Map();
    this.settings = defaultSettings;
  }

  /**
   * Get application instance
   * @returns {Application}
   */
  static app() {
    if (!Application.instance) {
      throw new RuntimeError('There isn\'t application instance, Application::createApp need to be called first.')
    }

    return Application.instance;
  }

  /**
   * Create application instance
   * @returns {Application}
   */
  static createApp() {
    return Application.instance = new Application();
  }

  /**
   * Get specified service
   * @param {string} serviceName
   * @returns {any}
   */
  getService(serviceName) {
    if (this.serviceContainer.has(serviceName)) {
      return this.serviceContainer.get(serviceName);
    }

    this.serviceContainer.set(
      serviceName, ServiceProvider.createService(serviceName, this)
    );

    return this.serviceContainer.get(serviceName);
  }

  async onBeforeBoot() {
    /**
     * @type {SettingService}
     * The application's settings will be maintanced in SettingService.
     */
    let settingService = this.getService('setting');

    /**
     * Get settings before doing anything else.
     */
    this.settings = await settingService.getSettings();
  }

  onBooted() {
    // this.getService('webRequest');
    browser.declarativeNetRequest.onRuleMatchedDebug.addListener(info => console.log(info));
  }

  /**
   * Fired when a connection is made from either an extension process or a
   * content script (by runtime.connect).
   * @param {object} port
   */
  onConnect(port) {
    if (port.name) {
      let portService = this.getService(port.name);
      portService.appendPort(port);
    }
  }

  /**
   * Fired when the extension is first installed, when the extension is updated
   * to a new version, and when Chrome is updated to a new version.
   * @param {string} [id]
   * @param {string} [previousVersion]
   * @param {string} reason [install, update, chrome_update, shared_module_updated]
   */
  async onInstalled({ id = undefined, previousVersion = undefined, reason }) {console.log(reason);
    if (reason === 'install' || reason === 'update') {
      if (reason === 'install') {
        this.getService('setting').updateSettings(defaultSettings);
      } else if (reason === 'update') {
        let currentVersion = browser.runtime.getManifest().version;
        let updater = new Updater(currentVersion, previousVersion, updates());
        await updater.update();
      }

      browser.action.setBadgeText({ text: 'NEW' });
      browser.action.setBadgeBackgroundColor({ color: '#FF0000' });
    }

    /**
     * Edit here if there are settings need to be update while the update.
     */
    // if (reason === 'install' || reason === 'update') {
    //   let settingService = this.getService('setting');
    //   let items = await settingService.getSettings();
    //   let updater = new Updater(items, defaultSettings);
    //   let version = browser.runtime.getManifest().version;

    //   await updater.mergeSettings({
    //     version,
    //     showUpdateChangeLog: false,
    //     importantNoticeDisplayed: updateSettings.importantNoticeDisplayed || false,
    //   });

    //   browser.action.setBadgeText({ text: 'NEW' });
    //   browser.action.setBadgeBackgroundColor({ color: '#FF0000' });
    // }
  }

  /**
   * Fired when a message is sent from either an extension process or a content
   * script
   * @param {*} param0
   */
  async onMessage(message, sender, sendResponse) {
    /**
     * Handling incoming message which needs call service method, if the sender
     * need a response, the method of service need return a valid that isn't
     * undefined
     */
    if (message.action) {
      let [serviceName, methodName] = message.action.split(':');

      let service = this.getService(serviceName);

      let params = { sender };

      if (message.args) {
        for (let name in message.args) {
          params[name] = message.args[name];
        }
      }

      let result = await service[methodName].call(service, params);

      if (result !== undefined) {
        sendResponse(result);
      }
    }
  }

  /**
   * Fired when an app or the device that it runs on needs to be restarted. The
   * app should close all its windows at its earliest convenient time to let the
   * restart to happen. If the app does nothing, a restart will be enforced
   * after a 24-hour grace period has passed. Currently, this event is only
   * fired for Chrome OS kiosk apps.
   *
   * @param {string} reason [app_update,os_update,periodic]
   */
  onRestartRequired(reason) {
    //
  }

  /**
   * Fired when a profile that has this extension installed first starts up.
   * This event is not fired when an incognito profile is started, even if this
   * extension is operating in 'split' incognito mode.
   */
  onStartup() {
    console.error('startup');
  }

  /**
   * Sent to the event page just before it is unloaded. This gives the extension
   * opportunity to do some clean up. Note that since the page is unloading, any
   * asynchronous operations started while handling this event are not guaranteed
   * to complete. If more activity for the event page occurs before it gets
   * unloaded the onSuspendCanceled event will be sent and the page won't be
   * unloaded.
   */
  onSuspend() {
    //
  }

  /**
   * Sent after onSuspend to indicate that the app won't be unloaded after all.
   */
  onSuspendCanceled() {
    //
  }

  /**
   * Fired when an update is available, but isn't installed immediately because
   * the app is currently running. If you do nothing, the update will be installed
   * the next time the background page gets unloaded, if you want it to be installed
   * sooner you can explicitly call chrome.runtime.reload(). If your extension is
   * using a persistent background page, the background page of course never gets
   * unloaded, so unless you call chrome.runtime.reload() manually in response to
   * this event the update will not get installed until the next time Chrome itself
   * restarts. If no handlers are listening for this event, and your extension has
   * a persistent background page, it behaves as if chrome.runtime.reload() is called
   * in response to this event.
   * @param {string} version version
   */
  onUpdateAvailable(version) {
    //
  }
}

export default Application;

/**
 * Export application helper function
 * @returns {Application}
 */
export function app() {
  return Application.app();
}
