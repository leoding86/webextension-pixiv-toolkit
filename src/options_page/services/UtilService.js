import AbstractService from "./AbstractService";
import browser from "@/modules/Extension/browser"

class UtilService extends AbstractService {
  static instance;

  constructor() {
    super();

    browser.storage.onChanged.addListener((changes, areaName) => {
      for (let key in changes) {
        this.application.settings[key] = changes[key].newValue;
      }
    });
  }

  static getService() {
    if (!UtilService.instance) {
      UtilService.instance = new UtilService();
    }

    return UtilService.instance;
  }

  async checkDownloadManager() {
    const DOWNLOADS_TAB = '__DOWNLOADS_TAB__';
    let settings = await browser.storage.local.get(null);

    if (settings && settings[DOWNLOADS_TAB]) {
      try {
        await chrome.tabs.get(settings[DOWNLOADS_TAB]);
        return true
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}

export default UtilService;
