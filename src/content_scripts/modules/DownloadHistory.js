import browser from "@/modules/Extension/browser";
import BaseDownloadHistory from "@/modules/DownloadHistory";

/**
 * @class DownloadHistory module in content page
 */
class DownloadHistory extends BaseDownloadHistory {
  /**
   * Get `DownloadHistory` instance
   * @override
   * @returns {DownloadHistory}
   */
  static create() {
    let instance = new DownloadHistory();
    instance.port = browser.runtime.connect({ name: 'downloadHistory' });
    instance.listenMessage();
    return instance;
  }
}

export default DownloadHistory;
