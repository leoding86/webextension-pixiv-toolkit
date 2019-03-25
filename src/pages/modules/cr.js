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
        }
    }
};

export default cr;