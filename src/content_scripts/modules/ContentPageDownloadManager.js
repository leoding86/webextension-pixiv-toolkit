/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 10:45:18
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 16:12:26
 * @FilePath: \webextension-pixiv-toolkit\src\content_scripts\modules\ContentPageDownloadManager.js
 */
import DownloadManager from "@/options_page/modules/DownloadManager";
import DownloadAdapter from "@/options_page/modules/DownloadAdapter";
import Event from '@/modules/Event';
import AbstractResource from "@/modules/PageResource/AbstractResource";
import GifGenerator from "./Legacy/UgoiraGenerator/GifGenerator";
import { RuntimeError } from "@/errors";

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

      instance.downloadManager.addListener('update', (taskId) => {
        const downloadTask = instance.downloadManager.getTask(taskId);
        instance.dispatch('update', [downloadTask]);
      });
    }

    return ContentPageDownloadManager.instance;
  }

  /**
   * @param {AbstractResource} resource
   * @param {{ ugoiraConvertType: string|undefined, selectedIndexes: number[]|undefined }} options
   * @param {{ redownload: boolean|undefined }} downloadOptions
   */
  async addTask(resource, options, downloadOptions = { redownload: false }) {
    const downloadTask = await this.downloadAdapter.createDownloadTask(resource, options);

    if (downloadOptions.redownload === true) {
      this.downloadManager.deleteTask(downloadTask.id);
    }

    if (downloadTask.type === 'PIXIV_UGOIRA') {
      if (options.ugoiraConvertType.toLowerCase() === 'gif') {
        downloadTask.generator = new GifGenerator();
      } else {
        throw new RuntimeError('NOT_SUPPORT_CONVERT_TYPE');
      }
    }

    await this.downloadManager.addTask(downloadTask);
  }
}

/**
 * @type {ContentPageDownloadManager}
 */
ContentPageDownloadManager.instance;

export default ContentPageDownloadManager;
