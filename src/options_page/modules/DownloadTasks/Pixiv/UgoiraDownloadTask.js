import { app } from "@/options_page/DownloadsApplication";
import AbstractDownloadTask from "../AbstractDownloadTask";
import browser from "@/modules/Extension/browser";
import Downloader from "@/modules/Net/Downloader";
import FileSystem from "../../FileSystem";
import NameFormatter from "@/modules/Util/NameFormatter";
import MimeType from "@/modules/Util/MimeType";
import pathjoin from "@/modules/Util/pathjoin";

/**
 * @typedef UgoiraDownloadTaskOptions
 * @property {string} id
 * @property {string} url
 * @property {string} resource
 * @property {any[]} frames
 * @property {string} renameRule
 * @property {0|1|2} packAnimationJsonType
 * @property {string} ffmpegCommandArgs
 * @property {any} context
 * @property {string} convertType
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
  processProgress = 0;

  /**
   * @type {import("@ffmpeg/ffmpeg").FFmpeg}
   */
  ffmpeg;

  /**
   *
   * @param {UgoiraDownloadTaskOptions} options
   */
  constructor(options) {
    super();

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
    this.downloader.addListener('pause', this.onPause, this);
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
   * @fires UgoiraDownloadTask#progress
   */
  onProgress({ progress, successCount, failCount}) {
    this.progress = progress;

    this.dispatch('progress', [this.progress]);
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

  /**
   *
   * @param {*} param0
   * @fires UgoiraDownloadTask#progress
   */
  async onItemFinish({ blob, mimeType }) {
    this.data = blob;

    let nameFormatter = NameFormatter.getFormatter({ context: this.context });

    let zip = new JSZip();
    await zip.loadAsync(blob);

    if (this.options.packAnimationJsonType > 0) {
      zip.file('animation.json', this.makeAnimationJsonContent(this.options.packAnimationJsonType));
    }

    let url = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }));

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url,
      filename: pathjoin(app().settings.downloadRelativeLocation, nameFormatter.format(
        this.options.renameRule
      )) + '.' + MimeType.getExtenstion(mimeType)
    });

    URL.revokeObjectURL(url);

    this.dispatch('progress', [this.progress]);
  }

  /**
   * When resource is downloaded, then generate animation file using ffmpeg
   * @fires UgoiraDownloadTask#progress
   * @fires UgoiraDownloadTask#complete
   */
  async onFinish() {
    this.changeState(this.PROCESSING_STATE);

    /**
     * FFmpeg loaded as external library
     */
    let { createFFmpeg } = FFmpeg;
    this.ffmpeg = new createFFmpeg({
      log: true,
      corePath: browser.runtime.getURL('lib/ffmpeg/ffmpeg-core.js'),
    });
    this.ffmpeg.setProgress(progress => {
      this.processProgress = progress.ratio;

      this.dispatch('progress', [this.processProgress]);
    });

    await this.ffmpeg.load();

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
      this.ffmpeg.FS('writeFile', filename, data);
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
    this.ffmpeg.FS('writeFile', 'input.txt', framesContent);
    loadedFiles.push('input.txt');

    let ffmpegCommand = this.options.ffmpegCommandArgs ? this.options.ffmpegCommandArgs.split(' ') : ['-f', 'concat', '-i', 'input.txt', '-plays', 0, 'out.gif'];
    let outputFilename = ffmpegCommand[ffmpegCommand.length - 1];

    await this.ffmpeg.run.apply(this.ffmpeg, ffmpegCommand);

    /**
     * Load data out from ffmpeg filesystem
     */
    let data = this.ffmpeg.FS('readFile', outputFilename);

    /**
     * Save file to disk
     */
    let animationFileUrl = URL.createObjectURL(new Blob([data], { type: MimeType.getFileMimeType(outputFilename) }));
    let nameFormatter = NameFormatter.getFormatter({ context: this.context });

    this.lastDownloadId = await FileSystem.getDefault().saveFile({
      url: animationFileUrl,
      filename: pathjoin(app().settings.downloadRelativeLocation, nameFormatter.format(
        this.options.renameRule
      )) + '.' + MimeType.getFileExtension(outputFilename)
    });

    URL.revokeObjectURL(animationFileUrl);

    loadedFiles.push(outputFilename);

    /**
     * Clearup assets
     */
    loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));

    this.ffmpeg.exit();
    this.ffmpeg = null;

    this.changeState(this.COMPLETE_STATE);
    this.dispatch('complete');
  }

  /**
   *
   * @param {*} error
   * @fires UgoiraDownloadTask#error
   */
  onItemError(error) {
    this.lastError = error;

    this.dispatch('error');
  }

  /**
   * Handle downloader abort event
   * @fires UgoiraDownloadTask#pause
   */
  onPause() {
    this.dispatch('pause');
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
   * @fires UgoiraDownloadTask#start
   * @param {boolean} reset
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

  abortProcess() {
    if (this.downloader) {
      this.downloader.pause();
    }

    if (this.ffmpeg) {
      this.ffmpeg.exit();
      this.processProgress = this.processedFramesCount = 0;
    }
  }

  /**
   * If the task is start to generate animation, then it can be stopped.
   * @override
   */
  pause() {
    if (this.state !== this.PROCESSING_STATE) {
      this.changeState(this.PAUSED_STATE);
      this.abortProcess();
    }
  }

  /**
   * @override
   */
  stop() {
    this.abortProcess();
  }

  /**
   * Convert task instance to json object
   * @return {object}
   */
  toJson() {
    return Object.assign({}, super.toJson(), {
      processProgress: this.processProgress,
      convertType: this.options.convertType
    });
  }
}

export default UgoiraDownloadTask;
