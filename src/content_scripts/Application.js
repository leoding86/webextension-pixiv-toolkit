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

  constructor() {
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

    // browser.runtime.onMessage.addListener(message => {
    //   debugger;
    // });

    return Application.instance;
  }

  async urlchangeHandler(newUrl, oldUrl) {
    try {
      let data = this.pageFilter.getData(newUrl);

      const adapter = new Adapter();
      this.resource = await adapter.getResource(data.type, data.url);

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

      throw error;
    }
  }
}

export default Application;

export function app() {
  return Application.app();
}
