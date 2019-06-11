import Event from '@/modules/Event'
import GifGenerator from '@/modules/Generator/GifGenerator'
import WebMGenerator from '@/modules/Generator/WebMGenerator'

class UgoiraTool {
  constructor(context) {
    this.context = context
    this.gifGenerator
    this.webMGenerator
    this.xhr = new XMLHttpRequest()
    this.zip
    this.event = new Event()
  }

  init() {
    let self = this

    this.gifGenerator = null
    this.webMGenerator = null
    this.xhr.abort()
    this.zip = new JSZip()

    return new Promise(resolve => {
      self.downloadResource().then(zipData => {
        if (thisApp.browserItems.enablePackUgoiraFramesInfo) {
          self.zip.file('frames.json', JSON.stringify(self.context.illustFrames));
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
      self.xhr.open('GET', this.context.illustOriginalSrc)

      self.xhr.onreadystatechange = () => {
        if (self.xhr.readyState === 4 && self.xhr.status === 200) {
          resolve(self.xhr.response)
        }
      }

      self.xhr.addEventListener('progress', e => {
        if (e.lengthComputable) {
          let progress = e.loaded / e.total

          self.event.dispatch('onProgress', [progress])
        }
      });

      self.xhr.overrideMimeType('text/plain; charset=x-user-defined')
      self.xhr.send()
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
