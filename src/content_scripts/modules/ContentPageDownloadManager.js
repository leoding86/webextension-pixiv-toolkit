import DownloadManager from "@/options_page/modules/DownloadManager";
import DownloadAdapter from "@/options_page/modules/DownloadAdapter";
import Event from '@/modules/Event';
import AbstractResource from "@/modules/PageResource/AbstractResource";

class ContentPageDownloadManager extends Event {
  /**
   * @type {DownloadManager}
   */
  downloadManager;

  /**
   * @type {DownloadAdapter}
   */
  downloadAdapter;

  static getDefault() {
    if (!ContentPageDownloadManager.instance) {
      const instance = ContentPageDownloadManager.instance = new ContentPageDownloadManager();

      instance.downloadAdapter = DownloadAdapter.create();
      instance.downloadManager = DownloadManager.getDefault();

      instance.downloadManager.addListener('error', (error) => {
        instance.dispatch('error', [error]);
      });

      instance.downloadManager.addListener('update', (status) => {
        instance.dispatch('update', [status]);
      });
    }

    return ContentPageDownloadManager.instance;
  }

  /**
   * @param {AbstractResource} resource
   * @param {{ ugoiraConvertType: string|undefined, selectedIndexes: number[]|undefined }} options
   */
  async addTask(resource, options) {
    try {
      const downloadTask = await this.downloadAdapter.createDownloadTask(resource, options);
      this.downloadManager.addTask(downloadTask);
      debugger;
    } catch (error) {
      console.error(error);
      debugger;
    }
  }
}

/**
 * @type {ContentPageDownloadManager}
 */
ContentPageDownloadManager.instance;

export default ContentPageDownloadManager;