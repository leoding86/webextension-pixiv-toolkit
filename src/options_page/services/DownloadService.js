import { RuntimeError } from "@/errors";
import AbstractService from "./AbstractService";
import browser from "@/modules/Extension/browser";
import MimeType from "@/modules/Util/MimeType";
import DownloadManager from "../modules/DownloadManager";
import DownloadAdapter from "../modules/DownloadAdapter";

class DownloadService extends AbstractService {
  static instance;

  /**
   * @type {DownloadManager}
   */
  downloadManager;

  constructor() {
    super();

    this.downloadManager = DownloadManager.getDefault();
  }

  static getService() {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }

    return DownloadService.instance;
  }

  /**
   * @deprecated
   * @param {any} param0
   * @returns
   */
  async download({ saveAs = false, filename, data = undefined, url = undefined }) {console.log(filename);
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

  async addDownload({ type, url, options = {} }) {
    let downloadAdapter = DownloadAdapter.create(type, url);
    let downloadTask = await downloadAdapter.createDownloadTask(options);

    this.downloadManager.addTask(downloadTask);
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
      case 'ugoira':
        key = 'statUgoiraDownloaded';
        break;
      case 'illust':
        key = 'statIllustDownloaded';
        break;
      case 'manga':
        key = 'statMangaDownloaded';
        break;
      case 'novel':
        key = 'statNovelDownloaded';
        break;
      default:
        throw new RuntimeError('Unkown stat downloaded type "' + type + '"');
    }

    let data = {};
    data[key] = typeof this.application.settings[key] === 'number' ? ++this.application.settings[key] : 0;

    this.application.getService('setting').updateSettings(data);
  }

  showInFolder(downloadId) {
    browser.downloads.show(downloadId)
  }
}

export default DownloadService;
