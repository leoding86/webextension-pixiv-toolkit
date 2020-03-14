import Event from '@/modules/Event';
import Download from '@/modules/Net/Download';
import GifGenerator from '@/modules/Generator/GifGenerator'
import WebMGenerator from '@/modules/Generator/WebMGenerator'
import APngGenerator from '@/modules/Generator/APngGenerator'

class UgoiraTool {
  constructor(context) {
    this.context = context
    this.gifGenerator
    this.webMGenerator

    /**
     * @var {Download}
     */
    this.download;

    this.zip;
    this.zipBlob;
    this.event = new Event()
  }

  init() {
    let self = this

    this.gifGenerator = null
    this.webMGenerator = null
    this.download && this.download.abort();
    this.zip = new JSZip()
    this.zipBlob = null

    return this.downloadResource().then(blob => {
      if ($extension.browserItems.enablePackUgoiraFramesInfo) {
        self.zip.file('animation.json', JSON.stringify(self.context.illustFrames));
      }

      return self.zip.loadAsync(blob)
    }).then(() => {
      self.gifGenerator = new GifGenerator(
        self.zip,
        self.context.illustMimeType,
        self.context.illustFrames
      )

      self.webMGenerator = new WebMGenerator(
        self.zip,
        self.context.illustMimeType,
        self.context.illustFrames
      )

      self.apngGenerator = new APngGenerator(
        self.zip,
        self.context.illustMimeType,
        self.context.illustFrames
      )

      self.event.dispatch('onFinish');

      return self.zip.generateAsync({
        type: 'blob'
      })
    }).then(blob => {
      this.zipBlob = blob

      return blob
    });
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
    let self = this

    return new Promise((resolve, reject) => {
      this.download && this.download.abort();

      this.download = new Download(this.context.illustOriginalSrc, { method: 'GET' });

      this.download.addListener('onload', blob => {
        resolve(blob)
      });

      this.download.addListener('onprogress', ({ totalLength, loadedLength }) => {
        self.event.dispatch('onProgress', [loadedLength / totalLength]);
      });

      this.download.addListener('onerror', error => {
        reject(error);
      });

      this.download.download();

      self.event.dispatch('onStart');
    })
  }

  generateGif(listeners) {
    if (listeners) {
      for (let i in listeners) {
        self.gifGenerator.event.addListener(i, listeners[i])
      }
    }

    self.gifGenerator.generate()
  }

  generateWebM(listeners) {
    if (listeners) {
      for (let i in listeners) {
        self.gifGenerator.event.addListener(i, listeners[i])
      }
    }

    self.webMGenerator.generate()
  }
}

export default UgoiraTool
