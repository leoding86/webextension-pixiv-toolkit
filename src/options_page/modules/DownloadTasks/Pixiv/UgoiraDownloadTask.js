import { app } from "@/options_page/DownloadsApplication";
import AbstractDownloadTask from "../AbstractDownloadTask";
import browser from "@/modules/Extension/browser";
import Downloader from "@/modules/Net/Downloader";
import FileSystem from "../../FileSystem";
import NameFormatter from "@/modules/Util/NameFormatter";
import MimeType from "@/modules/Util/MimeType";

/**
 * @typedef UgoiraDownloadTaskOptions
 * @property {string} id
 * @property {string} url
 * @property {string} resource
 * @property {any[]} frames
 * @property {string} renameRule
 * @property {0|1|2} packAnimationJsonType
 * @property {any} context
 *
 * @class
 */
class UgoiraDownloadTask extends AbstractDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_UGOIRA';

  /**
   * @type {UgoiraDownloadTaskOptions}
   */
  options;

  /**
   * @type {Downloader}
   */
  downloader;

  /**
   * @type {Blob} Download data
   */
  data;

  /**
   * @type {number} Count processed frames
   */
  processedFramesCount = 0;

  /**
   * @type {number} FFmpeg process progress
   */
  generateProgress = 0;

  /**
   *
   * @param {UgoiraDownloadTaskOptions} options
   */
  constructor(options) {
    super();

    this.UNSTOPPABLE_STATE = 99;

    this.id = options.id;
    this.url = options.url;
    this.title = options.context.title;
    this.context = options.context;
    this.options = options;
    this.downloader = new Downloader({ processors: app().settings.downloadTasksWhenDownloadingImages });
    this.downloader.appendFile(options.resource);
    this.downloader.addListener('start', this.onStart, this);
    this.downloader.addListener('progress', this.onProgress, this);
    this.downloader.addListener('item-finish', this.onItemFinish, this);
    this.downloader.addListener('finish', this.onFinish, this);
    this.downloader.addListener('item-error', this.onItemError, this);
    this.downloader.addListener('abort', this.onAbort, this);
    this.downloader.initial();
  }

  onStart() {
    //
  }

  /**
   * Handle downloader `onProgress` event
   * @param {{progress: number, successCount: number, failCount: number}} param0
   */
  onProgress({ progress, successCount, failCount}) {
    this.progress = progress;
  }

  makeAnimationJsonContent(type) {
    if (type == 1) {
      return JSON.stringify(this.context.illustFrames);
    } else if (type == 2) {
      return JSON.stringify({
        ugokuIllustData: {
          src: this.context.illustSrc,
          originalSrc: this.context.illustOriginalSrc,
          mime_type: this.context.illustMimeType,
          frames: this.context.illustFrames
        }
      })
    }
  }

  async onItemFinish({ blob, mimeType }) {
    this.data = blob;

    let nameFormatter = NameFormatter.getFormatter({ context: this.context });
    let settings = app().settings;

    let zip = new JSZip();
    await zip.loadAsync(blob);

    if (this.options.packAnimationJsonType > 0) {
      zip.file('animation.json', this.makeAnimationJsonContent(this.options.packAnimationJsonType));
    }

    let url = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url,
      filename: nameFormatter.format(
        settings.ugoiraRenameFormat
      ) + '.' + MimeType.getExtenstion(mimeType)
    });

    URL.revokeObjectURL(url);
  }

  /**
   * When resource is downloaded, then generate animation file using ffmpeg
   */
  async onFinish() {
    this.state = this.UNSTOPPABLE_STATE;

    /**
     * FFmpeg loaded as external library
     */
    let { createFFmpeg } = FFmpeg;
    let ffmpeg = new createFFmpeg({
      log: true,
      corePath: browser.runtime.getURL('lib/ffmpeg/ffmpeg-core.js'),
    });
    ffmpeg.setProgress(progress => {
      this.generateProgress = progress.ratio;
    });

    await ffmpeg.load();

    let zip = new JSZip();
    await zip.loadAsync(this.data);

    let framesContent = '';
    let loadedFiles = [];

    /**
     * Add files to ffmpeg file system
     */
    for (let i = 0; i < this.options.frames.length; i++) {
      let frame = this.options.frames[i];
      let data = await zip.file(frame.file).async('uint8array');
      let indexStr = i + '';
      let filename = '0'.repeat(6 - indexStr.length) + i + '.jpg';
      ffmpeg.FS('writeFile', filename, data);
      loadedFiles.push(filename);

      /**
       * Build frames information
       */
      framesContent += `file '${frame.file}'` + "\r\n";
      framesContent += `duration ${frame.delay / 1000}` + "\r\n";
    }

    /**
     * Add frames to ffmpeg file system
     */
    ffmpeg.FS('writeFile', 'input.txt', framesContent);
    loadedFiles.push('input.txt');

    await ffmpeg.run.apply(ffmpeg, ['-f', 'concat', '-i', 'input.txt', '-plays', 0, 'out.gif']);

    /**
     * Load data out from ffmpeg filesystem
     */
    let data = ffmpeg.FS('readFile', 'out.gif');

    /**
     * Save file to disk
     */
    let animationFileUrl = URL.createObjectURL(new Blob([data], { type: 'image/gif' }));
    let nameFormatter = NameFormatter.getFormatter({ context: this.context });
    let settings = app().settings;

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url: animationFileUrl,
      filename: nameFormatter.format(
        settings.ugoiraRenameFormat
      ) + '.gif'
    });

    URL.revokeObjectURL(animationFileUrl);

    loadedFiles.push('out.gif');

    /**
     * Clearup assets
     */
    loadedFiles.forEach(file => ffmpeg.FS('unlink', file));

    ffmpeg.exit();

    this.state = this.COMPLETE_STATE;
  }

  onItemError(error) {
    this.lastError = error;
  }

  /**
   * Handle downloader abort event
   */
  onAbort() {
    // this.state = this.PAUSED_STATE;
  }

  /**
   * Create a pixiv illustration download task
   * @param {UgoiraDownloadTaskOptions} options
   * @returns {UgoiraDownloadTask}
   */
  static create(options) {
    return new UgoiraDownloadTask(options);
  }

  /**
   * @override
   */
  start() {
    this.checkCouldStart();
    this.state = this.DOWNLOADING_STATE;
    this.downloader.download();
  }

  /**
   * If the task is start to generate animation, then it can be stopped.
   * @override
   */
  pause() {
    if (this.state !== this.UNSTOPPABLE_STATE) {
      this.state = this.PAUSED_STATE;
      this.downloader.pause();
    }
  }

  /**
   * @override
   */
  stop() {
    this.downloader.pause();
  }

  /**
   * Convert task instance to json object
   * @return {object}
   */
  toJson() {
    return Object.assign({}, super.toJson(), {
      generateProgress: this.generateProgress
    });
  }
}

export default UgoiraDownloadTask;
