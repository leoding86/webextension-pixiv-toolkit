import { RuntimeError } from "@/errors";
import Event from "@/modules/Event";
import browser from "@/modules/Extension/browser";

/**
 * @class Basic DownloadHistory module
 */
class DownloadHistory extends Event {
  /**
   * Channel port
   * @type {any}
   */
  port;

  /**
   * Get `DownloadHistory` instance
   * @returns {DownloadHistory}
   */
  static create() {
    let instance = new DownloadHistory();
    instance.port = browser.runtime.connect({ name: 'downloadHistory' });
    instance.listenMessage();
    return instance;
  }

  /**
   * Listen message from background
   */
  listenMessage() {
    /**
     * Because download history will just recieve data from background and
     * render the list and it will not send any data after that, so the `port`
     * is no use here.
     */
    this.port.onMessage.addListener((message, port) => {
      if (message.error) {
        throw new RuntimeError(message.error);
      }

      if (message.service && message.service === 'downloadHistory' && messsage.method) {
        this.dispatch(message.method, [message, port]);
      }
    });
  }

  postMessage(method, message) {
    this.port.postMessage({ service: 'downloadService', method, message });
  }

  putRecord(record) {
    this.postMessage('putRecord', { record });
  }

  listRecords({ query, limit, skip }) {
    this.postMessage('listRecords', { query, limit, skip });
  }

  deleteRecord({ id }) {
    this.postMessage('deleteRecord', { id });
  }

  clearRecords() {
    this.postMessage('clearRecords');
  }
}

export default DownloadHistory;
