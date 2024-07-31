
import { app } from "@/options_page/DownloadsApplication";
import AbstractDownloadTask from "@/options_page/modules/DownloadTasks/AbstractDownloadTask";
import Downloader from "@/modules/Net/Downloader";
import FileSystem from "@/options_page/modules/FileSystem";
import NameFormattor from "@/modules/Util/NameFormatter";
import MimeType from "@/modules/Util/MimeType";
import pathjoin from "@/modules/Util/pathjoin";
import { decrypteImage } from "@/modules/Parser/PixivComic/ImageDecrypte";

/**
 * @class
 */
class EpisodeDownloadTask extends AbstractDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_COMIC_EPISODE';

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
    this.downloader = new Downloader({
      processors: app().settings.downloadTasksWhenDownloadingImages,
      beforeItemDownload: ({ requestOptions, downloadFile }) => {
        requestOptions.headers = {
          'x-cobalt-thumber-parameter-gridshuffle-key': this.options.pages[downloadFile.args.index].key
        };
      },
      afterItemDownload: ({ itemFinishData, downloadFile }) => {
        return new Promise(async (resolve) => {
          const blob = await decrypteImage(this.options.pages[downloadFile.args.index], itemFinishData.blob, 'blob');
          itemFinishData.blob = blob;
          resolve();
        });
      }
    });
    this.downloader.addListener('start', this.onStart, this);
    this.downloader.addListener('progress', this.onProgress, this);
    this.downloader.addListener('item-finish', this.onItemFinish, this);
    this.downloader.addListener('finish', this.onFinish, this);
    this.downloader.addListener('item-error', this.onItemError, this);
    this.downloader.addListener('pause', this.onPause, this);

    if (this.options.selectedIndexes && this.options.selectedIndexes.length > 0) {
      this.options.pages.forEach((page, index) => {
        if (this.options.selectedIndexes.indexOf(index) > -1) {
          this.downloader.appendFile(page.url, { index });
        }
      });
    } else {
      this.options.pages.forEach((page, index) => this.downloader.appendFile(page.url, { index }));
    }
  }

  /**
   *
   * @param {number|string} pageNum
   * @returns {number|string}
   */
  buildPageNum(pageNum) {
    if (typeof pageNum !== 'number') {
      pageNum = parseInt(pageNum);
    }

    if (this.options.pageNumberStartWithOne) {
      pageNum++;
    }

    let pageNumberLength;

    if (this.options.pageNumberLength > 1) {
      pageNumberLength = this.options.pageNumberLength;
    } else if (this.options.pageNumberLength == -1) {
      pageNumberLength = `${this.context.totalPages}`.length;
    }

    if (pageNumberLength) {
      if (`${pageNum}`.length >= pageNumberLength) {
        return pageNum;
      } else {
        return '0'.repeat(pageNumberLength - `${pageNum}`.length) + pageNum;
      }
    } else {
      return pageNum;
    }
  }

  /**
   * Handle downloader `onStart` event
   */
  onStart() {
    //
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
    let pageNum = this.buildPageNum(args.index);
    let nameFormatter = NameFormattor.getFormatter({
      context: Object.assign({}, this.context, { pageNum })
    });

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url,
      filename: pathjoin(app().settings.downloadRelativeLocation ,nameFormatter.format(
        this.options.renameRule,
        this.id + `_${pageNum}`
      )) + `.${MimeType.getExtenstion(mimeType)}`
    });

    URL.revokeObjectURL(url);

    this.dispatch('progress', [this.progress]);
  }

  /**
   * @fires MultipleDownloadTask#complete
   */
  onFinish() {
    this.changeState(this.COMPLETE_STATE);
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
    //
  }

  /**
   * Create a pixiv illustration download task
   * @param {MultipleDownloadTaskOptions} options
   * @returns {EpisodeDownloadTask}
   */
  static create(options) {
    return new EpisodeDownloadTask(options);
  }

  /**
   * @override
   * @fires MultipleDownloadTask#start
   * @param {bollean} reset
   */
  start(reset = false) {
    if (reset) {
      this.downloader.reset();
    }

    if (this.isPending()) {
      this.changeState(this.DOWNLOADING_STATE);
      this.dispatch('start');
      this.downloader.download();
    }
  }

  /**
   * @override
   */
  pause() {
    this.changeState(this.PAUSED_STATE);
    this.downloader.pause();
  }

  /**
   * @override
   */
  stop() {
    this.downloader.pause();
  }
}

export default EpisodeDownloadTask;
