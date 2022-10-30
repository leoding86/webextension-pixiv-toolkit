import { RuntimeError } from '@/errors';
import { SettingService } from './services';
import defaultSettings from '@/config/default';
import ServiceProvider from './services/ServiceProvider';

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
    //
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
}

export default Application;

/**
 * Export application helper function
 * @returns {Application}
 */
export function app() {
  return Application.app();
}
