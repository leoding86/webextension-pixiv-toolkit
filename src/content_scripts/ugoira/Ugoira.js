import Event from '@/modules/Event'
import Request from '@/modules/Util/Request';
import GifGenerator from '@/modules/Generator/GifGenerator'
import WebMGenerator from '@/modules/Generator/WebMGenerator'
import APngGenerator from '@/modules/Generator/APngGenerator'

class UgoiraTool {
  constructor(context) {
    this.context = context
    this.gifGenerator
    this.webMGenerator
    this.request = new Request();
    this.zip;
    this.zipBlob;
    this.event = new Event()
  }

  init() {
    let self = this

    this.gifGenerator = null
    this.webMGenerator = null
    this.request.abort()
    this.zip = new JSZip()
    this.zipBlob = null

    return self.downloadResource().then(zipData => {
      if ($extension.browserItems.enablePackUgoiraFramesInfo) {
        self.zip.file('animation.json', JSON.stringify(self.context.illustFrames));
      }

      return self.zip.loadAsync(zipData)
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

  enableDisplayDownloadProgress() {
    this.request.readAsStream();
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
      self.request.open('GET', this.context.illustOriginalSrc);

      if (self.request.isReadAsStream()) {
        let body = [];

        self.request.event.addExclusiveListener('ondata', data => {
          data.forEach(char => {
            body.push(char);
          });
        });

        self.request.event.addExclusiveListener('onprogress', progress => {
          self.event.dispatch('onProgress', [progress]);
        });

        self.request.event.addExclusiveListener('onfinish', () => {
          resolve((new Uint8Array(body)).buffer);
        });
      } else {
        self.request.event.addExclusiveListener('onload', response=> {
          resolve(response.arrayBuffer());
        });
      }

      self.request.event.addExclusiveListener('onerror', error => {
        reject(error);
      });

      self.request.send();

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
