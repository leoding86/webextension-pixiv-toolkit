import Browser from '@/modules/Browser/Browser';

export default {
  contains: function (permissions) {
    return new Promise(function (resolve) {
      let browser = Browser.getBrowser();

      browser.runtime.sendMessage({
        action: 'permission:containsPermissions',
        args: { permissions }
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
        action: 'permission:requestPermissions',
        args: { permissions }
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
        action: 'permission:removePermissions',
        args: { permissions }
      }, function (removed) {
        resolve(removed);
        return;
      });
    });
  }
}
