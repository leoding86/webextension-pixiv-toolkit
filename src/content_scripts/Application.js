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

  constructor() {
    this.pageFilter = new PageFilter();
    this.detector = new Detector();

    this.detector.addListener('urlchange', this.urlchangeHandler);
  }

  static app() {
    if (!Application.instance) {
      Application.instance = new Application();
    }

    return Application.instance;
  }

  createUI() {
    return UIApplication.createApp();
  }

  urlchangeHandler(oldUrl, newUrl) {
    try {
      let data = this.pageFilter.getData(newUrl);

      if (!this.UIApp) {
        this.UIApp = this.createUI();
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
