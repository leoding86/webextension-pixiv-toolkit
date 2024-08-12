import { RuntimeError } from "@/errors";
import AbstractService from "./AbstractService";
import browser from "@/modules/Extension/browser";
import DownloadAdapter from "../modules/DownloadAdapter";
import DownloadManager from "../modules/DownloadManager";
import MimeType from "@/modules/Util/MimeType";
import PageResourceFactory from '@/modules/PageResource/Factory';
import Db from "@/modules/Db/Db";
import DownloadTaskExistsError from "@/errors/DownloadTaskExistsError";

/**
 * @class Download service
 */
class DownloadService extends AbstractService {
  /**
   * @type {DownloadService}
   */
  static instance;

  /**
   * @type {DownloadManager}
   */
  downloadManager;

  static getService() {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }

    return DownloadService.instance;
  }

  initialize() {
    this.downloadManager = DownloadManager.getDefault();
    this.downloadManager.setMaxDownloadingTasks(this.application.settings.maxProcessDownloadTasks);
  }

  checkReady() {
    return this.downloadManager ? true :  false;
  }

  /**
   * @deprecated
   * @param {any} param0
   * @returns
   */
  async download({ saveAs = false, filename, data = undefined, url = undefined }) {
    let downloadOptions = {
      saveAs: !!saveAs
    };

    if (filename.indexOf('/') === 0) {
      downloadOptions.filename = filename.substr(1);
    } else {
      downloadOptions.filename = filename;
    }

    if (data) {
      downloadOptions.url = URL.createObjectURL(new Blob(
        [new Uint8Array(data).buffer],
        {
          type: MimeType.getFileMimeType(downloadOptions.filename)
        }
      ));
    } else {
      downloadOptions.url = url;
    }

    return new Promise(resolve => {
      browser.downloads.download(downloadOptions, downloadId => {
        resolve(downloadId);
      });
    });
  }

  getAvaliableDownloads() {
    return this.downloadManager.getAvaliableTasksJson();
  }

  flushChangedTasks() {
    return this.downloadManager.flushChangedTasks();
  }

  /**
   * Receive data and add a download
   * @param {{ unpackedResource: Object, options: any}} param0
   * @returns {Object}
   */
  async addDownload({ unpackedResource, options = {} }) {
    /**
     * Create page resource instance using unpacked resource data
     */
    let pageResource = PageResourceFactory.createPageResource(unpackedResource);

    let downloadAdapter = DownloadAdapter.create();

    let downloadTask = await downloadAdapter.createDownloadTask(pageResource, options);

    try {
      if (options.redownload) {
        const oldDownloadTask = this.downloadManager.getTask(downloadTask.id);

        if (oldDownloadTask.isComplete() || oldDownloadTask.isFailure()) {
          this.downloadManager.deleteTask(downloadTask.id);
        } else {
          throw new DownloadTaskExistsError();
        }
      }

      await this.downloadManager.addTask(downloadTask);

      this.dispatch(DownloadService.TASK_ADDED_EVENT, [downloadTask]);

      this.updateDownloadedStat({ type: downloadTask.type });

      return {
        result: true
      };
    } catch (error) {
      return {
        result: false,
        errorName: error.name
      };
    }
  }

  async startDownload(id) {
    this.downloadManager.startTask(id);
  }

  async pauseDownload(id) {
    this.downloadManager.pauseTask(id);
  }

  async stopDownload(id) {
    this.downloadManager.stopTask(id);
  }

  async deleteDownload(id) {
    this.downloadManager.deleteTask(id);
  }

  updateDownloadedStat({ type }) {
    let key = '';

    switch (type) {
      case "PIXIV_UGOIRA":
        key = 'statUgoiraDownloaded';
        break;
      case 'PIXIV_ILLUST':
        key = 'statIllustDownloaded';
        break;
      case 'PIXIV_MANGA':
        key = 'statMangaDownloaded';
        break;
      case 'PIXIV_NOVEL':
        key = 'statNovelDownloaded';
        break;
      case 'PIXIV_COMIC_EPISODE':
        key = 'statComicEpisodeDownloaded';
        break;
      default:
        key = 'statUnkownDownloaded';
    }

    let data = {};
    data[key] = typeof this.application.settings[key] === 'number' ? ++this.application.settings[key] : 1;

    this.application.getService('setting').updateSettings(data);
  }

  showInFolder(downloadId) {
    browser.downloads.show(downloadId)
  }

  async checkIfDownloadManagerOpened() {
    let tab = await browser.tabs.getCurrent();

    return {
      result: window.__CURRENT_ACTIVE_DM__,
      data: {
        tabId: tab.id,
        windowId: tab.windowId,
      }
    };
  }

  async checkIfDownloaded({ uid }) {
    let historyRepo = Db.getDb().historyRepo();
    let item = await historyRepo.getItem({ uid });

    if (item && item.downloaded_at) {
      return item.downloaded_at;
    } else {
      return 0;
    }
  }
}

DownloadService.TASK_ADDED_EVENT = 'task-added';

export default DownloadService;
