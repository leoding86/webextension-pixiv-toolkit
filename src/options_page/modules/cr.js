let cr = {
    _e: function (string) {
        return chrome.i18n.getMessage(string);
    },

    _s: {
        get (key) {
            return new Promise(function (resolve) {
                chrome.storage.local.get(key, function (items) {
                    return resolve(items);
                });
            });
        },

        set (object) {
            return new Promise(function (resolve) {
                chrome.storage.local.set(object, function () {
                    return resolve();
                });
            });
        },

        remove (key) {
            return new Promise(function (resolve) {
                chrome.storage.local.remove(key, function () {
                    return resolve();
                })
            });
        },

        onChanged: {
          addListener: function (listener) {
            chrome.storage.onChanged.addListener(listener);
          },

          removeListener: function (listener) {
            chrome.storage.onChanged.removeListener(listener);
          }
        }
    },

    _r: {
      getURL (src) {
        return chrome.runtime.getURL(src);
      }
    }
};

export default cr;
