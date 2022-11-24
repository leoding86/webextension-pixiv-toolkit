import Detector from "./modules/Detector";
import PageFilter from "./modules/PageFilter";
import UIApplication from "./UIApplication";

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

    return Application.instance;
  }

  async urlchangeHandler(newUrl, oldUrl) {
    try {
      let data = this.pageFilter.getData(newUrl);

      if (!this.UIApp) {
        this.UIApp = await UIApplication.createApp();
      }

      this.UIApp.loadData(data);
    } catch (error) {
      if (this.UIApp) {
        this.UIApp.unload();
      }

      throw error;
    }
  }
}

export default Application;

export function app() {
  return Application.app();
}
