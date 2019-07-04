import Browser from '@/modules/Browser/Browser';

export default {
  download(options) {
    return new Promise(function (resolve, reject) {
      let browser = Browser.getBrowser();

      browser.runtime.sendMessage({
        action: 'download',
        options: options
      }, function (downloadId) {
        if (downloadId === undefined) {
          reject(browser.runtime.lastError);
          return;
        }

        resolve(downloadId);
        return;
      });
    });
  }
}
