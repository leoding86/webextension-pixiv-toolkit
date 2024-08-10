import Adapter from '@/content_scripts/modules/Adapter';
import Detector from "./modules/Detector";
import PageFilter from "./modules/PageFilter";
import UIApplication from "./UIApplication";
import browser from "@/modules/Extension/browser";

class Application {
  /**
   * @type {Application}
   */
  static instance;

  /**
   * @type {Detector}
   */
  detector;

  /**
   * @type {PageFilter}
   */
  pageFilter;

  /**
   * @type {UIApplication}
   */
  UIApp;

  /**
   * @type {Object} Current page's resource
   */
  resource;

  /**
   * @type {any}
   */
  settings;

  /**
   * @type {any} browser port
   */
  downloadTaskProgressObserverPort;

  constructor() {
    browser.storage.local.get(null, items => {
      this.settings = items;
    });

    browser.storage.onChanged.addListener(changes => {
      for (let key in changes) {
        this.settings[key] = changes[key].newValue;
      }
    });

    this.pageFilter = new PageFilter();
    this.detector = new Detector();
    this.detector.addListener('urlchange', this.urlchangeHandler, this);
    this.detector.observeUrl();

    /**
     * Call the urlchangeHandler at the application has been initailizatied
     */
    this.urlchangeHandler(window.location.href, null);
  }

  static app() {
    if (!Application.instance) {
      Application.instance = new Application();
    }

    return Application.instance;
  }

  getDownloadTaskProgressObserverPort() {
    if (!this.downloadTaskProgressObserverPort) {
      this.downloadTaskProgressObserverPort = browser.runtime.connect({ name: 'download-task-progress-observer' });
      this.downloadTaskProgressObserverPort.onMessage.addListener((message) => {
        console.log(message);
      });
      this.downloadTaskProgressObserverPort.onDisconnect.addListener((port) => {
        this.downloadTaskProgressObserverPort = null;
      });
    }

    return this.downloadTaskProgressObserverPort;
  }

  async urlchangeHandler(newUrl, oldUrl) {
    try {
      const donwloadTaskProgressObserverPort = this.getDownloadTaskProgressObserverPort();

      let data = this.pageFilter.getData(newUrl);

      const adapter = new Adapter();
      this.resource = await adapter.getResource(data.type, data.url);

      /**
       * Send item resource to observe the task progress from option page
       */
      donwloadTaskProgressObserverPort.postMessage({
        action: 'observe-download-progress',
        resource: this.resource
      });

      if (!this.UIApp) {
        this.UIApp = await UIApplication.createApp();
      }

      this.UIApp.loadData(data);

      browser.runtime.sendMessage({ to: 'ws', action: 'badge:activeIcon' });
    } catch (error) {
      browser.runtime.sendMessage({ to: 'ws', action: 'badge:deactiveAction' })

      if (this.UIApp) {
        this.UIApp.unload();
        this.UIApp = null;
      }

      this.resource = null;

      console.error(error);
    }
  }
}

export default Application;

export function app() {
  return Application.app();
}
