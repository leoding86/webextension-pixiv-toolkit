const { default: browser } = require("@/modules/Extension/browser");

/**
 * @typedef SaveFileOptions
 * @property {string} url
 * @property {string} filename
 */
class FileSystem {
  /**
   * @type {FileSystem}
   */
  static instance;

  /**
   * @returns {FileSystem}
   */
  static getDefault() {
    if (!FileSystem.instance) {
      FileSystem.instance = new FileSystem();
    }

    return FileSystem.instance;
  }

  /**
   * Save file
   * @param {SaveFileOptions} options
   */
  saveFile(options) {
    return new Promise(resolve => {
      browser.downloads.download({
        url: options.url,
        filename: options.filename,
      }, downloadId => {
        resolve(downloadId);
      });
    });
  }

  /**
   * Save file in background
   * @param {SaveFileOptions} options
   */
  async saveFileInBackground(options) {
    return await browser.runtime.sendMessage({
      to: 'ws',
      action: 'download:saveFile',
      args: {
        url: options.url,
        filename: options.filename
      }
    });
  }
}

export default FileSystem;
