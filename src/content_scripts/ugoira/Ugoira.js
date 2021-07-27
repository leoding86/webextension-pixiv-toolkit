import APngGenerator from '@/modules/Generator/APngGenerator'
import Download from '@/modules/Net/Download';
import Event from '@/modules/Event';
import GifGenerator from '@/modules/Generator/GifGenerator'
import Retryer from '@/modules/Manager/Retryer';
import WebMGenerator from '@/modules/Generator/WebMGenerator';
import FFmpegGIFGenerator from '@/modules/Generator/FFmpeg/GIFGenerator';
import FFmpegAPNGGenerator from '@/modules/Generator/FFmpeg/APNGGenerator';
import FFmpegWebMGenerator from '@/modules/Generator/FFmpeg/WebMGenerator';
import browser from '@/modules/Extension/browser';

/**
 * @class
 */
class UgoiraTool extends Event {
  /**
   * @constructor
   * @param {Object} context
   */
  constructor(context) {
    super();

    /**
     * @property {Object}
     */
    this.context = context

    /**
     * @property {Download}
     */
    this.download;

    this.zip;

    /**
     * @property {Blob}
     */
    this.zipBlob;

    /**
     * @property {Number}
     */
    this.animationJsonFormat;
  }

  init() {
    let self = this

    this.download && this.download.abort();
    this.zip = new JSZip()
    this.zipBlob = null

    return this.downloadResource().then(blob => {
      if (this.animationJsonFormat > 0) {
        self.zip.file('animation.json', self.makeAnimationJsonContent());
      }

      return self.zip.loadAsync(blob)
    }).then(() => {
      return self.zip.generateAsync({
        type: 'blob'
      })
    }).then(blob => {
      this.zipBlob = blob

      return blob
    });
  }

  isReady() {
    return this.zipBlob;
  }

  getUserId() {
    return this.context.userId
  }

  getUserName() {
    return this.context.userName
  }

  getId() {
    return this.context.illustId
  }

  getImages() {
    return this.context.urls
  }

  getThumb() {
    return this.getImages().thumb;
  }

  getTitle() {
    return this.context.illustTitle
  }

  isR() {
    return !!this.context.r
  }

  /**
   * @returns {String}
   */
  makeAnimationJsonContent() {
    if (this.animationJsonFormat === 1) {
      return JSON.stringify(this.context.illustFrames)
    } else if (this.animationJsonFormat === 2) {
      return JSON.stringify({
        ugokuIllustData: {
          src: this.context.illustSrc,
          originalSrc: this.context.illustOriginalSrc,
          mime_type: this.context.illustMimeType,
          frames: this.context.illustFrames
        }
      });
    } else {
      return '';
    }
  }

  downloadResource() {
    let retryer = new Retryer({ maxTime: 3 });

    return retryer.start(() => {
      return new Promise((resolve, reject) => {
        this.download && this.download.abort();

        this.download = new Download(this.context.illustOriginalSrc, { method: 'GET' });

        this.download.addListener('onload', blob => {
          resolve(blob)
        });

        this.download.addListener('onprogress', ({ totalLength, loadedLength }) => {
          this.dispatch('progress', [loadedLength / totalLength]);
        });

        this.download.addListener('onerror', error => {
          reject(error);
        });

        this.download.download();

        this.dispatch('start');
      })
    });
  }

  /**
   *
   * @param {'gif'|'webm'|'apng'} type
   * @param {'default'|'ffmpeg'} [tool=default]
   */
  getGenerator(type, tool = 'default') {
    if (tool === 'default') {
      return Promise.resolve(this.makeGenerator(type));
    } else if (tool === 'ffmpeg') {
      return Promise.resolve(this.makeFFmpegGenerator(type));
    }
  }

  /**
   * Make the file generator
   * @param {'gif'|'webm'|'apng'} type
   */
  makeGenerator(type) {
    let GeneratorConstructor = null;

    switch (type) {
      case 'gif':
        GeneratorConstructor = GifGenerator;
        break;
      case 'webm':
        GeneratorConstructor = WebMGenerator;
        break;
      case 'apng':
        GeneratorConstructor = APngGenerator;
        break;
      default:
        throw Error('Invalid generator type');
    }

    return new GeneratorConstructor(this.zip, this.context.illustMimeType, this.context.illustFrames);
  }

  makeFFmpegGenerator(type) {
    let GeneratorConstructor = null;

    switch (type) {
      case 'gif':
        GeneratorConstructor = FFmpegGIFGenerator;
        break;
      case 'webm':
        GeneratorConstructor = FFmpegWebMGenerator;
        break;
      case 'apng':
        GeneratorConstructor = FFmpegAPNGGenerator;
        break;
      default:
        throw new Error('Invliad generator type')
    }

    let generator = new GeneratorConstructor({
      corePath: browser.extension.getURL('lib/ffmpeg/ffmpeg-core.js'),
      log: true,
    });

    return generator.prepareGenerator(this.zip, this.context.illustMimeType, this.context.illustFrames);
  }
}

export default UgoiraTool
