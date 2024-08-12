/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 10:45:18
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-12 19:44:33
 * @FilePath: \webextension-pixiv-toolkit\src\content_scripts\modules\ContentPageDownloadManager.js
 */
import DownloadManager from "@/options_page/modules/DownloadManager";
import DownloadAdapter from "@/options_page/modules/DownloadAdapter";
import Event from '@/modules/Event';
import AbstractResource from "@/modules/PageResource/AbstractResource";
import GifGenerator from "./Legacy/UgoiraGenerator/GifGenerator";
import { RuntimeError } from "@/errors";
import WebmGenerator from "./Legacy/UgoiraGenerator/WebmGenerator";
import ApngGenerator from "./Legacy/UgoiraGenerator/ApngGenerator";

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
      const instance = ContentPageDownloadManager.instance = ContentPageDownloadManager.create();
    }

    return ContentPageDownloadManager.instance;
  }

  static create() {
    const instance = new ContentPageDownloadManager();

    instance.downloadAdapter = DownloadAdapter.create();
    instance.downloadManager = DownloadManager.getDefault();

    instance.downloadManager.addListener('error', (error) => {
      instance.dispatch('error', [error]);
    });

    instance.downloadManager.addListener('update', (taskIds) => {
      const downloadTasks = [];

      taskIds.forEach(taskId => {
        downloadTasks.push(instance.downloadManager.getTask(taskId));
        instance.dispatch('update', [downloadTasks]);
      });
    });

    return instance;
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
      const ugoiraConvertTypeInLowerCase = options.ugoiraConvertType.toLowerCase();
      if (ugoiraConvertTypeInLowerCase === 'gif') {
        downloadTask.generator = new GifGenerator();
      } else if (ugoiraConvertTypeInLowerCase === 'webm') {
        downloadTask.generator = new WebmGenerator();
      } else if (ugoiraConvertTypeInLowerCase === 'apng') {
        downloadTask.generator = new ApngGenerator();
      } else {
        throw new RuntimeError('NOT_SUPPORT_CONVERT_TYPE');
      }
    }

    await this.downloadManager.addTask(downloadTask);
  }

  exit() {
    this.downloadManager.getAllTasks().forEach(downloadTask => {
      downloadTask.stop();
    });
  }
}

/**
 * @type {ContentPageDownloadManager}
 */
ContentPageDownloadManager.instance;

export default ContentPageDownloadManager;
