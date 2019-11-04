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
    this.zip
    this.event = new Event()
  }

  init() {
    let self = this

    this.gifGenerator = null
    this.webMGenerator = null
    this.request.abort()
    this.zip = new JSZip()

    return new Promise(resolve => {
      self.downloadResource().then(zipData => {
        if (thisApp.browserItems.enablePackUgoiraFramesInfo) {
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
        resolve(blob)
      })
    })
  }

  getUserId() {
    return this.context.userId
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

    return new Promise(resolve => {
      self.request.open('GET', this.context.illustOriginalSrc);

      self.request.event.addExclusiveListener('onload', response=> {
        response.arrayBuffer().then(ab => {
          resolve(ab);
        });
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
