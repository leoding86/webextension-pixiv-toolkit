import browser from '../Extension/browser';
import versionCompare from '@/modules/Util/versionCompare';

class Updater {
  constructor(currentSettings, defaultSettings) {
    this.currentSettings = currentSettings;
    this.defaultSettings = defaultSettings;
  }

  isNewer(version) {
      return !this.currentSettings.version || versionCompare(this.currentSettings.version, version) < 0
  }

  mergeSettings(overrideSettings = {}) {
    Object.assign(this.currentSettings, overrideSettings);
    let currentSettingKeys = Object.keys(this.currentSettings);
    let defaultSettingKeys = Object.keys(this.defaultSettings);

    defaultSettingKeys.forEach(key => {
      if (undefined === this.currentSettings[key]) {
        this.currentSettings[key] = this.defaultSettings[key];
      }
    });

    let removeSettingKeys = currentSettingKeys.filter(key => defaultSettingKeys.indexOf(key) === -1);

    return new Promise(resolve => {
      browser.storage.local.set(this.currentSettings, () => {
        browser.storage.local.remove(removeSettingKeys, () => {
          resolve();
        });
      });
    });
  }
}

export default Updater;
