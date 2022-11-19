import { app } from "@/options_page/DownloadsApplication";
import AbstractDownloadTask from "./AbstractDownloadTask";
import Downloader from "@/modules/Net/Downloader";
import FileSystem from "../FileSystem";
import NameFormattor from "@/modules/Util/NameFormatter";
import MimeType from "@/modules/Util/MimeType";

/**
 * @typedef MultipleDownloadTaskOptions
 * @property {string} id
 * @property {string} url
 * @property {string[]} pages
 * @property {number[]} selectedIndexes
 * @property {string} renameRule
 * @property {any} context
 *
 * @class
 */
class MultipleDownloadTask extends AbstractDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'UNDEFINED';

  /**
   * @type {MultipleDownloadTaskOptions}
   */
  options;

  /**
   * @type {Downloader}
   */
  downloader;

  /**
   *
   * @param {MultipleDownloadTaskOptions} options
   */
  constructor(options) {
    super();

    this.options = options;
    this.id = options.id;
    this.url = options.url;
    this.state = this.PENDING_STATE;
    this.title = options.context.title;
    this.context = options.context;
    this.downloader = new Downloader({ processors: app().settings.downloadTasksWhenDownloadingImages });
    this.downloader.addListener('start', this.onStart, this);
    this.downloader.addListener('progress', this.onProgress, this);
    this.downloader.addListener('item-finish', this.onItemFinish, this);
    this.downloader.addListener('finish', this.onFinish, this);
    this.downloader.addListener('item-error', this.onItemError, this);
    this.downloader.addListener('pause', this.onPause, this);

    if (this.options.selectedIndexes && this.options.selectedIndexes.length > 0) {
      this.options.pages.forEach((page, index) => {
        if (this.options.selectedIndexes.indexOf(index) > -1) {
          this.downloader.appendFile(page, { index });
        }
      });
    } else {
      this.options.pages.forEach((page, index) => this.downloader.appendFile(page, { index }));
    }
  }

  onStart() {
    this.state = this.DOWNLOADING_STATE;
  }

  /**
   * Handle downloader `onProgress` event
   * @param {{progress: number, successCount: number, failCount: number}} param0
   * @fires MultipleDownloadTask#progress
   */
  onProgress({ progress, successCount, failCount}) {
    this.progress = progress;
    this.dispatch('progress', [this.progress]);
  }

  /**
   *
   * @param {*} param0
   * @fires MultipleDownloadTask#progress
   */
  async onItemFinish({ blob, args, mimeType }) {
    let url = URL.createObjectURL(blob);
    let nameFormatter = NameFormattor.getFormatter({
      context: Object.assign({}, this.context, { pageNum: args.index })
    });

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url,
      filename: nameFormatter.format(
        this.options.renameRule,
        this.id + `_${args.index}`
      ) + `.${MimeType.getExtenstion(mimeType)}`
    });

    URL.revokeObjectURL(url);

    this.dispatch('progress', [this.progress]);
  }

  /**
   * @fires MultipleDownloadTask#complete
   */
  onFinish() {
    this.state = this.COMPLETE_STATE;
    this.dispatch('complete');
  }

  /**
   *
   * @param {*} error
   * @fires MultipleDownloadTask#error
   */
  onItemError(error) {
    this.lastError = error;
    this.dispatch('error');
  }

  /**
   * @fires MultipleDownloadTask#pause
   */
  onPause() {
    this.dispatch('pause');
  }

  /**
   * Create a pixiv illustration download task
   * @param {MultipleDownloadTaskOptions} options
   * @returns {MultipleDownloadTask}
   */
  static create(options) {
    return new MultipleDownloadTask(options);
  }

  /**
   * @override
   * @fires MultipleDownloadTask#start
   */
  start() {
    this.state = this.DOWNLOADING_STATE;
    this.downloader.download();
    this.dispatch('start');
  }

  /**
   * @override
   */
  pause() {
    this.state = this.PAUSED_STATE;
    this.downloader.pause();
  }

  /**
   * @override
   */
  stop() {
    //
  }
}

export default MultipleDownloadTask;
