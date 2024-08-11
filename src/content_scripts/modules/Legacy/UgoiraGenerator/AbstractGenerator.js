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

  stop() {
    throw new NotImplementedError();
  }
}

export default AbstractGenerator;
