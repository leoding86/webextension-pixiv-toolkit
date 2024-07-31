import AbstractService from "./AbstractService";
import browser from "@/modules/Extension/browser"
import DownloadManager from "../modules/DownloadManager";

class SettingService extends AbstractService {
  static instance;

  constructor() {
    super();

    browser.storage.onChanged.addListener((changes, areaName) => {
      for (let key in changes) {
        this.application.settings[key] = changes[key].newValue;

        if (key === 'maxProcessDownloadTasks') {
          DownloadManager.getDefault().setMaxDownloadingTasks(changes[key].newValue);
        }
      }
    });
  }

  static getService() {
    if (!SettingService.instance) {
      SettingService.instance = new SettingService();
    }

    return SettingService.instance;
  }

  getSetting(keys) {
    return new Promise(resolve => {
      browser.storage.local.get(keys, items => { resolve(items) });
    });
  }

  getSettings() {
    return new Promise((resolve, reject) => {
      browser.storage.local.get(null, items => { resolve(items) });
    });
  }

  updateSettings(settings) {
    return new Promise(resolve => {
      browser.storage.local.set(settings, () => {
        resolve();
      });
    });
  }
}

export default SettingService;
