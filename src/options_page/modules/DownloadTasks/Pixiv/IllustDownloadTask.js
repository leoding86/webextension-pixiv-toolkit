/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-01 01:14:07
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-22 13:05:04
 * @FilePath: \webextension-pixiv-toolkit\src\options_page\modules\DownloadTasks\Pixiv\IllustDownloadTask.js
 */
import MultipleDownloadTask from "../MultiplePagesDownloadTask";

/**
 * @class
 */
class IllustDownloadTask extends MultipleDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_ILLUST';

  /**
   *
   * @param {import("../MultiplePagesDownloadTask").MultipleDownloadTaskOptions} options
   */
  constructor(options) {
    super(options);
  }

  /**
   * Create a pixiv illustration download task
   * @param {any} options
   * @returns
   */
  static create(options) {
    return new IllustDownloadTask(options);
  }

  /**
   * @override
   * @returns {true}
   */
  canSaveInfo() {
    return true;
  }
}

export default IllustDownloadTask;
