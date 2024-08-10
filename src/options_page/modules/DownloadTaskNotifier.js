import browser from "@/modules/Extension/browser";
import DownloadManager from "./DownloadManager";

/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-08 14:51:10
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-08 15:10:06
 */
class DownloadTaskNotifier {
  downloadTaskPorts = new Map();

  downloadTasksStatusNotifyTimeout;

  /**
   * @type {DownloadManager}
   */
  downloadManager

  /**
   * @returns {DownloadTaskNotifier}
   */
  static getDefault() {
    if (!DownloadTaskNotifier.instance) {
      DownloadTaskNotifier.instance = new DownloadTaskNotifier();
    }

    return DownloadTaskNotifier.instance;
  }

  initialize() {
    this.downloadManager = DownloadManager.getDefault();

    browser.runtime.onConnect.addListener(port => {
      if (port.name === DownloadTaskNotifier.channelName) {
        if (this.hasDownloadTaskPort(port)) {
          return;
        }

        this.appendDownloadTaskPort(port);

        port.onDisconnect.addListener(port => {
          this.deleteDownloadTaskPort(port);
        });

        /**
         * Listener download resource data from content script which want to kown the task progress
         */
        port.onMessage.addListener((message, port) => {
          if (port.name !== DownloadTaskNotifier.channelName) {
            return;
          }

          if (message.args && message.args.downloadTaskIds) {
            const downloadTaskPort = this.getDownloadTaskPort(port);

            if (downloadTaskPort) {
              downloadTaskPort.downloadTaskIds = message.args.downloadTaskIds;
              this.notifyDownloadTaskStatus();
            }
          }
        });
      }
    });
  }

  notifyDownloadTaskStatus() {
    try {
      if (this.downloadTasksStatusNotifyTimeout) {
        clearTimeout(this.downloadTasksStatusNotifyTimeout);
      }

      this.downloadTaskPorts.values().forEach(downloadTaskPort => {
        const downloadTaskIds = downloadTaskPort.downloadTaskIds;

        if (!Array.isArray(downloadTaskIds)) {
          return;
        }

        const downloadTasksStatus = [];

        downloadTaskIds.forEach(id => {
          try {
            const status = this.downloadManager.getTask(id).toJson()
            downloadTasksStatus.push(status);
          } catch (error) {
            // console.error(error);
          }
        });

        if (downloadTasksStatus.length > 0) {
          downloadTaskPort.port.postMessage({
            downloadTasksStatus
          });
        }
      });

      this.downloadTasksStatusNotifyTimeout = setTimeout(() => {
        this.notifyDownloadTaskStatus();
      }, 600);
    } catch (error) {
      // console.error(error);
    }
  }

  createDownloadTaskPort(port) {
    return {
      port, downloadTaskIds: []
    };
  }

  hasDownloadTaskPort(port) {
    return this.downloadTaskPorts.has(port);
  }

  appendDownloadTaskPort(port) {
    if (!this.downloadTaskPorts.has(port)) {
      this.downloadTaskPorts.set(port, this.createDownloadTaskPort(port));
    }
  }

  deleteDownloadTaskPort(port) {
    if (this.hasDownloadTaskPort(port)) {
      this.downloadTaskPorts.delete(port);
    }
  }

  getDownloadTaskPort(port) {
    if (this.hasDownloadTaskPort(port)) {
      return this.downloadTaskPorts.get(port);
    }
  }

  updatePortDownloadTask(port, { downloadTaskIds }) {
    const downloadTaskPort = this.getDownloadTaskPort(port);

    if (downloadTaskPort) {
      downloadTaskPort.downloadTaskIds = downloadTaskIds;
    }
  }
}

/**
 * @type {DownloadTaskNotifier}
 */
DownloadTaskNotifier.instance;

DownloadTaskNotifier.channelName = 'downloadManager:observeDownloadTasks';

export default DownloadTaskNotifier;
