/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 14:34:30
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 22:40:36
 * @FilePath: \webextension-pixiv-toolkit\src\content_scripts\modules\Legacy\UgoiraGenerator\AbstractGenerator.js
 */
import NotImplementedError from "@/errors/NotImplementedError";
import AbstractDownloadTask from "@/options_page/modules/DownloadTasks/AbstractDownloadTask";
import Event from "@/modules/Event";

class AbstractGenerator extends Event {
  dispatchProgress(progress) {
    this.dispatch('progress', [progress]);
  }

  dispatchComplete([blob, mimeType]) {
    this.dispatch('complete', [blob, mimeType]);
  }

  dispatchError(error) {
    this.dispatch('error', [error]);
  }

  /**
   *
   * @param {AbstractDownloadTask} downloadTask
   */
  generate(downloadTask) {
    throw new NotImplementedError();
  }

  /**
   * A generator can't be stopped in runtime, this method is just a placeholder
   */
  stop() {
    //
  }
}

export default AbstractGenerator;
