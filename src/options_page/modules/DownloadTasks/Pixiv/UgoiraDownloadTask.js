import GlobalSettings from "@/modules/GlobalSettings";
import AbstractDownloadTask from "../AbstractDownloadTask";
import browser from "@/modules/Extension/browser";
import Downloader from "@/modules/Net/Downloader";
import FileSystem from "../../FileSystem";
import NameFormatter from "@/modules/Util/NameFormatter";
import MimeType from "@/modules/Util/MimeType";
import pathjoin from "@/modules/Util/pathjoin";
import AbstractGenerator from "@/content_scripts/modules/Legacy/UgoiraGenerator/AbstractGenerator";

class ZipRepo {
  /**
   * @type {ZipRepo}
   */
  static instance;

  container = new Map();

  static getDefault() {
    if (!ZipRepo.instance) {
      ZipRepo.instance = new ZipRepo();
    }

    return ZipRepo.instance;
  }

  storeZip(uid, data) {
    this.container.set(uid, data);
  }

  getZip(uid) {
    const zip = this.container.get(uid);

    if (zip) {
      return zip;
    }
  }
}

/**
 * @typedef UgoiraDownloadTaskOptions
 * @property {string} uid
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
   * @type {AbstractGenerator}
   */
  generator;

  zip;

  /**
   *
   * @param {UgoiraDownloadTaskOptions} options
   */
  constructor(options) {
    super();

    this.uid = options.uid;
    this.id = options.id;
    this.url = options.url;
    this.title = options.context.title;
    this.context = options.context;
    this.options = options;

    this.downloader = new Downloader({ processors: GlobalSettings().downloadTasksWhenDownloadingImages });
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
    ZipRepo.getDefault().storeZip(this.uid, blob);

    this.data = blob;

    let nameFormatter = NameFormatter.getFormatter({ context: this.context });

    this.zip = new JSZip();
    await this.zip.loadAsync(blob);

    if (this.options.packAnimationJsonType > 0) {
      this.zip.file('animation.json', this.makeAnimationJsonContent(this.options.packAnimationJsonType));
    }

    let url = URL.createObjectURL(await this.zip.generateAsync({ type: 'blob' }));

    this.lastDownloadId = await browser.runtime.sendMessage({
      to: 'ws', action: 'download:saveFile',
      args: {
        url,
        filename: pathjoin(GlobalSettings().downloadRelativeLocation, nameFormatter.format(
          this.options.renameRule
        )) + '.' + MimeType.getExtenstion(mimeType)
      }
    })

    URL.revokeObjectURL(url);

    this.dispatch('progress', [this.progress]);

    /**
     * Save work information accroding the enableDownloadMetadata setting
     */
    if (GlobalSettings().enableDownloadMetadata && this.options.context) {
      const blob = new Blob([JSON.stringify(this.options.context)], { type: 'application/json' });
      await browser.runtime.sendMessage({
        to: 'ws', action: 'download:saveFile',
        args: {
          url: URL.createObjectURL(blob),
          filename: 'info.json'
        }
      });
    }
  }

  /**
   *
   * @param {(args: { data: any, outputFilename: string}) => void} completeHandler
   * @returns
   */
  async runFFmpeg(completeHandler) {
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

    let framesContent = '';
    let loadedFiles = [];

    /**
     * Add files to ffmpeg file system
     */
    for (let i = 0; i < this.options.frames.length; i++) {
      let frame = this.options.frames[i];
      let data = await this.zip.file(frame.file).async('uint8array');
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

    /**
     * parse ffmpeg command line(s)
     */
    const ffmpegCommands = [];
    const ffmpegCommandSetting = this.options.ffmpegCommandArgs ?
      this.options.ffmpegCommandArgs.trim() :
      null;

    if (!ffmpegCommandSetting) {
      ffmpegCommands.push(['-f', 'concat', '-i', 'input.txt', '-plays', 0, 'out.gif']);
    } else {
      const lines = ffmpegCommandSetting.split(/\r\n|\n|\r/);

      lines.forEach(line => {
        ffmpegCommands.push(line.trim().split(' '));
      });
    }

    const lastCommand = ffmpegCommands[ffmpegCommands.length - 1];
    const outputFilename = lastCommand[lastCommand.length - 1];

    for (const seq in ffmpegCommands) {
      console.log(ffmpegCommands[seq]);
      await this.ffmpeg.run.apply(this.ffmpeg, ffmpegCommands[seq]);
    }

    await completeHandler.call(this, {
      data: this.ffmpeg.FS('readFile', outputFilename),
      outputFilename
    });

    loadedFiles.push(outputFilename);

    /**
     * Clearup assets
     */
    loadedFiles.forEach(file => this.ffmpeg.FS('unlink', file));

    this.ffmpeg.exit();
    this.ffmpeg = null;
  }

  /**
   * When resource is downloaded, then generate animation file using ffmpeg
   * @fires UgoiraDownloadTask#progress
   * @fires UgoiraDownloadTask#complete
   */
  async onFinish() {
    this.changeState(this.PROCESSING_STATE);

    if (this.generator) {
      this.generator.addListener('progress', (progress) => {
        this.processProgress = progress;
        this.dispatch('progress', [progress]);
      });

      this.generator.addListener('complete', async (blob, mimeType) => {
        /**
         * Save file to disk
         */
        let animationFileUrl = URL.createObjectURL(blob);
        let nameFormatter = NameFormatter.getFormatter({ context: this.context });

        const downloadId = await browser.runtime.sendMessage({
          to: 'ws',
          action: 'download:saveFile',
          args: {
            url: animationFileUrl,
            filename: pathjoin(GlobalSettings().downloadRelativeLocation, nameFormatter.format(
              this.options.renameRule
            )) + '.' + MimeType.getExtenstion(mimeType)
          }
        });

        console.log(downloadId);

        URL.revokeObjectURL(animationFileUrl);

        this.dispatch('complete');
      });

      this.generator.addListener('error', (error) => {
        this.changeState(this.FAILURE_STATE);
        this.dispatch('error', [error]);
      });

      this.generator.generate(this);

      return;
    }

    await this.runFFmpeg(async ({ data, outputFilename }) => {
      /**
       * Save file to disk
       */
      let animationFileUrl = URL.createObjectURL(new Blob([data], { type: MimeType.getFileMimeType(outputFilename) }));
      let nameFormatter = NameFormatter.getFormatter({ context: this.context });

      this.lastDownloadId = await browser.runtime.sendMessage({
        to: 'ws',
        action: 'download:saveFile',
        args: {
          url: animationFileUrl,
          filename: pathjoin(GlobalSettings().downloadRelativeLocation, nameFormatter.format(
            this.options.renameRule
          )) + '.' + MimeType.getFileExtension(outputFilename)
        }
      });

      URL.revokeObjectURL(animationFileUrl);
    });

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
  async start(reset = false) {
    if (reset) {
      this.downloader.reset();
    }

    if (this.isPending()) {
      this.zipRepo = ZipRepo.getDefault();

      /**
       * Here we get the zip file from cache repo, if get one then skip the download
       * process and start download onFinish event handler manully.
       */
      const data = this.zipRepo.getZip(this.uid);

      if (data) {
        this.data = data;
        this.zip = new JSZip();
        await this.zip.loadAsync(this.data);
        this.progress = 1;
        this.dispatch('progress', [this.progress]);
        this.onFinish();
      } else {
        this.changeState(this.DOWNLOADING_STATE);
        this.dispatch('start');
        this.downloader.download();
      }
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

    if (this.generator) {
      this.generator.stop();
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
