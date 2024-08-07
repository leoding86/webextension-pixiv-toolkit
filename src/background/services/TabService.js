import browser from "@/modules/Extension/browser";
import AbstractService from "./AbstractService";

/**
 * @class History service
 */
 class TabService extends AbstractService {
  /**
   * @type {TabService}
   */
  static instance;

  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   *
   * @returns {TabService}
   */
  static getService() {
    if (!TabService.instance) {
        TabService.instance = new TabService();
    }

    return TabService.instance;
  }

  async openTab(args) {
    return await browser.tabs.create({
        url: args.url,
        active: false
    });
  }
}

export default TabService;
