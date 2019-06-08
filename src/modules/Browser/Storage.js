import Browser from './Browser';

class Storage {

  static instance;

  constructor(scope = 'local') {
    this.storage = Browser.getBrowser().storage;
    this.storageArea = this.storage[scope];
  }

  static getInstance(scope) {
    if (Storage.instance !== undefined) {
      return Storage.instance;
    }

    return Storage.instance = new Storage(scope);
  }

  static getStorage (scope = 'local') {
    let instance = Storage.getInstance(scope);

    return instance.storageArea;
  }

  get(keys) {
    let self = this;

    return new Promise(function (resolve) {
      self.storageArea.get(keys, function (items) {
        resolve(items);
      });
    });
  }

  set(items) {
    let self = this;

    return new Promise(function (resolve) {
      self.storageArea.set(items, function () {
        resolve();
      });
    });
  }

  remove(keys) {
    let self = this;

    return new Promise(function (resolve) {
      self.storageArea.remove(keys, function () {
        resolve();
      });
    });
  }

  onChanged() {
    return this.storage.onChanged;
  }
}

export default Storage;
