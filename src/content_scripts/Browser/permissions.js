import Browser from '@/modules/Browser/Browser';

export default {
  contains: function (permissions) {
    return new Promise(function (resolve) {
      let browser = Browser.getBrowser();

      browser.runtime.sendMessage({
        action: 'containsPermissions',
        permissions: permissions
      }, function (result) {
        resolve(result);
        return;
      });
    });
  },

  request: function (permissions) {
    return new Promise(function (resolve) {
      let browser = Browser.getBrowser();

      browser.runtime.sendMessage({
        action: 'requestPermissions',
        permissions: permissions
      }, function (granted) {
        resolve(granted);
        return;
      });
    });
  },

  remove: function (permissions) {
    return new Promise(function (resolve) {
      let browser = Browser.getBrowser();

      browser.runtime.sendMessage({
        action: 'removePermissions',
        permissions: permissions
      }, function (removed) {
        resolve(removed);
        return;
      });
    });
  }
}
