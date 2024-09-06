import GlobalSettings from "@/modules/GlobalSettings";
import AbstractDownloadTask from "@/options_page/modules/DownloadTasks/AbstractDownloadTask";
import Downloader from "@/modules/Net/Downloader";
import FileSystem from "@/options_page/modules/FileSystem";
import NameFormattor from "@/modules/Util/NameFormatter";
import MimeType from "@/modules/Util/MimeType";
import pathjoin from "@/modules/Util/pathjoin";
import { decrypteImage } from "@/modules/Parser/PixivComic/ImageDecrypte";
import MultipleDownloadTask from "../MultiplePagesDownloadTask";

/**
 * @class
 */
class EpisodeDownloadTask extends MultipleDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_COMIC_EPISODE';

  options;

  /**
   * @type {JSZip}
   */
  zip;

  /**
   * @type {Downloader}
   */
  downloader;

  /**
   *
   * @param {MultipleDownloadTaskOptions} options
   */
  constructor(options) {
    super(options);

    this.options = options;
    this.id = options.id;
    this.url = options.url;
    this.state = this.PENDING_STATE;
    this.title = options.context.title;
    this.context = options.context;
    this.zip = new JSZip();
    this.zipMultipleImages = GlobalSettings().globalZipMultipleImages;
    this.downloader = new Downloader({
      processors: GlobalSettings().downloadTasksWhenDownloadingImages,
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
    let pageNum = this.buildPageNum(args.index);
    let nameFormatter = NameFormattor.getFormatter({
      context: Object.assign({}, this.context, { pageNum })
    });

    if (this.shouldZipFile()) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const file = nameFormatter.format(this.options.renameImageRule, `p${pageNum}`) + `.${MimeType.getExtenstion(mimeType)}`;
      this.zip.file(file, blob, { date: now });
    } else {
      let url = URL.createObjectURL(blob);

      this.lastDownloadId = await FileSystem.getDefault().saveFileInBackground({
        url,
        filename: pathjoin(GlobalSettings().downloadRelativeLocation,
          nameFormatter.format(this.options.renameRule, this.context.id),
          nameFormatter.format(this.options.renameImageRule, this.context.id + `_p${pageNum}`),
        ) + `.${MimeType.getExtenstion(mimeType)}`
      });

      URL.revokeObjectURL(url);
    }

    this.dispatch('progress', [this.progress]);
  }

  /**
   * @fires MultipleDownloadTask#complete
   */
  onFinish() {
    if (this.shouldZipFile()) {
      const nameFormatter = NameFormattor.getFormatter({ context: Object.assign({}, this.context) });

      this.zip.generateAsync({ type: 'blob' }).then(async blob => {
        this.lastDownloadId = await FileSystem.getDefault().saveFileInBackground({
          url: URL.createObjectURL(blob),
          filename: pathjoin(GlobalSettings().downloadRelativeLocation, nameFormatter.format(this.options.renameRule, this.context.id)) + '.zip'
        });

        this.changeState(this.COMPLETE_STATE);
        this.dispatch('complete');
      });
    } else {
      this.changeState(this.COMPLETE_STATE);
      this.dispatch('complete');
    }
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
