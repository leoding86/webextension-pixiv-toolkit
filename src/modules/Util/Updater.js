import Browser from '@/modules/Browser/Browser';
import versionCompare from '@/modules/Util/versionCompare';

function Updater(currentSettings) {
    this.currentSettings = currentSettings,
    this.browser = Browser.getBrowser();
    this.defaultSettings;
}

Updater.prototype = {
    setDefaultSettings: function (defaultSettings) {
        this.defaultSettings = defaultSettings;
        return this;
    },

    removeSettings: function (settingsNeededRemoved) {
        this.browser.storage.local.remove(settingsNeededRemoved);
    },

    mergeSettings: function (callback) {
        var self = this;

        Object.keys(this.defaultSettings).forEach(function (key) {
            if (undefined === self.currentSettings[key]) {
                self.currentSettings[key] = self.defaultSettings[key];
            }
        });

        this.storageSettings(this.currentSettings, callback);
    },

    updateSetting: function (setting, callback) {
        this.storageSettings(setting, callback);
    },

    storageSettings: function (settings, callback) {
        let self = this;

        this.browser.storage.local.set(settings, function () {
            callback.call(self);
        });
    },

    isNewer: function (version) {
        return !this.currentSettings.version || versionCompare(this.currentSettings.version, version) < 0
    }
}

export default Updater;
