import { app } from "@/options_page/DownloadsApplication";
import AbstractDownloadTask from "../AbstractDownloadTask";
import Downloader from "@/modules/Net/Downloader";
import FileSystem from "../../FileSystem";
import NameFormattor from "@/modules/Util/NameFormatter";
import MimeType from "@/modules/Util/MimeType";

/**
 * @typedef IllustDownloadTaskOptions
 * @property {string} id
 * @property {string} url
 * @property {string[]} pages
 * @property {number[]} selectedIndex
 * @property {string} renameRule
 * @property {any} context
 *
 * @class
 */
class IllustDownloadTask extends AbstractDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_ILLUST';

  /**
   * @type {IllustDownloadTaskOptions}
   */
  options;

  /**
   * @type {Downloader}
   */
  downloader;

  /**
   *
   * @param {IllustDownloadTaskOptions} options
   */
  constructor(options) {
    super();

    this.id = options.id;
    this.url = options.url;
    this.state = this.PENDING_STATE;
    this.title = options.context.title;
    this.context = options.context;
    this.options = options;
    this.downloader = new Downloader({ processors: app().settings.downloadTasksWhenDownloadingImages });
    this.downloader.addListener('start', this.onStart, this);
    this.downloader.addListener('progress', this.onProgress, this);
    this.downloader.addListener('item-finish', this.onItemFinish, this);
    this.downloader.addListener('finish', this.onFinish, this);
    this.downloader.addListener('item-error', this.onItemError, this);
    this.downloader.addListener('paused', this.onPaused, this);

    this.options.pages.forEach(page => this.downloader.appendFile(page));
    this.downloader.initial();
  }

  onStart() {
    this.state = this.DOWNLOADING_STATE;
  }

  /**
   * Handle downloader `onProgress` event
   * @param {{progress: number, successCount: number, failCount: number}} param0
   */
  onProgress({ progress, successCount, failCount}) {
    this.progress = progress;
  }

  async onItemFinish({ blob, index, mimeType }) {
    let url = URL.createObjectURL(blob);
    let nameFormatter = NameFormattor.getFormatter({
      context: Object.assign({}, this.context, { pageNum: index })
    });
    let settings = app().settings;

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url,
      filename: nameFormatter.format(
        settings.illustrationRenameFormat + '/' + settings.illustrationImageRenameFormat,
        this.id + `_${index}`
      ) + `.${MimeType.getExtenstion(mimeType)}`
    });

    URL.revokeObjectURL(url);
  }

  onFinish() {
    this.state = this.COMPLETE_STATE;
  }

  onItemError(error) {
    this.lastError = error;
  }

  onPaused() {
    //
  }

  /**
   * Create a pixiv illustration download task
   * @param {IllustDownloadTaskOptions} options
   * @returns {IllustDownloadTask}
   */
  static create(options) {
    return new IllustDownloadTask(options);
  }

  /**
   * @override
   */
  start() {
    this.state = this.DOWNLOADING_STATE;
    this.downloader.download();
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
    this.downloader.pause();
  }
}

export default IllustDownloadTask;
