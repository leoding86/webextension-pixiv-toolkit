import Browser from '@/modules/Browser/Browser';

/**
 * @typedef DownloadOptions
 * @property {ArrayBuffer} arrayBuffer
 * @property {string} url
 * @property {boolean} saveAs
 * @property {string} filename
 */
export default {
  /**
   *
   * @param {DownloadOptions} options
   * @returns
   */
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
