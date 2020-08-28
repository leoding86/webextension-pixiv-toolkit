import Browser from '@/modules/Browser/Browser';

/**
 * The put and forget operations should be called in background thread only, or there maybe cause data confliction
 */
export default class HistoryBackup {

  /**
   * @type {HistoryBackup}
   */
  static default;

  constructor() {
    this.items = [];
    this.limit = 5000;
    this.browser = Browser.getBrowser();
  }

  /**
   * @returns {HistoryBackup}
   */
  static getDefault() {
    if (!HistoryBackup.default) {
      HistoryBackup.default = new HistoryBackup();

      const key = HistoryBackup.default.getKey();

      /* This operation should be done in a second */
      HistoryBackup.default.browser.storage.local.get(key, items => {
        HistoryBackup.default.items = items[key] || [];
      });
    }

    return HistoryBackup.default;
  }

  getKey() {
    return 'historyBackup';
  }

  reachLimit() {
    return this.items.length >= this.limit;
  }

  free() {
    if (this.items.length > this.limit) {
      this.items.splice(0, this.items.length - this.limit);
    }
  }

  saveItems() {
    this.free();

    let data = {};

    data[this.getKey()] = this.items;

    this.browser.storage.local.set(data, () => {
      if (this.browser.runtime.lastError) {
        console.log(this.browser.runtime.lastError);
      }
    });
  }

  putBackup(data) {
    this.items.forEach((item, i) => {
      if (data.id === item.id) {
        this.items.splice(i, 1);
      }
    });

    this.items.push(data);

    this.saveItems();
  }

  forgetBackup(id) {
    this.items.forEach((item, i) => {
      if (id === item.id) {
        this.items.splice(i, 1);
      }
    });

    this.saveItems();
  }

  forgetAll() {
    let data = {};

    this.items = [];
    data[this.getKey()] = [];

    this.browser.storage.local.set(data, () => {
      if (this.browser.runtime.lastError) {
        console.log(this.browser.runtime.lastError);
      }
    });
  }
}
