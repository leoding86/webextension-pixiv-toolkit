/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-08 09:27:28
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-08 12:25:22
 */
import Event from "@/modules/Event";
import browser from "@/modules/Extension/browser";

class DownloadTaskObserver extends Event {
  port = null;

  downloadTaskIds = null;

  channelName = 'downloadManager:observeDownloadTasks';

  static getObserver() {
    if (!DownloadTaskObserver.instance) {
      DownloadTaskObserver.instance = new DownloadTaskObserver();
    }

    return DownloadTaskObserver.instance;
  }

  getDownloadManagerPort() {
    if (this.port) {
      this.port.disconnect();
      this.port = null;
    }

    this.port = browser.runtime.connect({ name: this.channelName });

    this.port.onDisconnect.addListener(() => {
      this.port = null;
    });

    this.port.onMessage.addListener((message, port) => {
      if (port.name === this.channelName) {
        this.dispatch('status', [message]);
      }
    });

    return this.port;
  }

  /**
   * Start observing download task
   * @param {string[]} downloadTaskIds Download task id
   */
  observeDownloadTasks(downloadTaskIds) {
    this.getDownloadManagerPort().postMessage({
      args: { downloadTaskIds }
    });
  }

  stopObserve() {
    if (this.port) {
      this.port.disconnect();
    }
  }
}

/**
 * @type {DownloadTaskObserver}
 */
DownloadTaskObserver.instance;

export default DownloadTaskObserver;
