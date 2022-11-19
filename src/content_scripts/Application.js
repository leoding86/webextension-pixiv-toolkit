import Detector from "./modules/Detector";
import PageFilter from "./modules/PageFilter";
import UIApplication from "./UIApplication";

class Application {
  static instance;

  detector;

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
    this.detector.addListener('urlchange', this.urlchangeHandler);
    this.detector.observeUrl();

    /**
     * Call the urlchangeHandler at the application has been initailizatied
     */
    this.urlchangeHandler(null, window.location.href);
  }

  static app() {
    if (!Application.instance) {
      Application.instance = new Application();
    }

    return Application.instance;
  }

  async urlchangeHandler(oldUrl, newUrl) {
    try {
      let data = this.pageFilter.getData(newUrl);

      if (!this.UIApp) {
        this.UIApp = await UIApplication.createApp();
      }

      this.UIApp.loadData(data);
    } catch (e) {
      if (this.UIApp) {
        this.UIApp.unload();
      }
    }
  }
}

export default Application;

export function app() {
  return Application.app();
}
