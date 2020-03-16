import Event from '@/modules/Event';
import Retryer from '@/modules/Manager/Retryer';
import Download from '@/modules/Net/Download';
import GifGenerator from '@/modules/Generator/GifGenerator'
import WebMGenerator from '@/modules/Generator/WebMGenerator'
import APngGenerator from '@/modules/Generator/APngGenerator'

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
  }

  init() {
    let self = this

    this.download && this.download.abort();
    this.zip = new JSZip()
    this.zipBlob = null

    return this.downloadResource().then(blob => {
      if ($extension.browserItems.enablePackUgoiraFramesInfo) {
        self.zip.file('animation.json', JSON.stringify(self.context.illustFrames));
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

  getTitle() {
    return this.context.illustTitle
  }

  isR() {
    return !!this.context.r
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
}

export default UgoiraTool
