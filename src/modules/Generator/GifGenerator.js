import Event from '@/modules/Event'
import getImageSize from '@/modules/Util/getImageSize'
import worker from './GifGeneratorWorker'

class GifGenerator {
  constructor(zip, mimeType, frames) {
    this.status = 0
    this.mimeType = mimeType
    this.frames = frames
    this.gif
    this.zip = zip
    this.event = new Event()
  }

  appendImageToGifFrame(currentIndex, currentDuration = 0) {
    let self = this

    return new Promise(resolve => {
      let index = currentIndex || 0

      if (index < self.frames.length) {
        self.zip.file(self.frames[index].file).async('base64').then(base64 => {
          let imageBase64 = "data:" + self.mimeType + ";base64," + base64,
              image = new Image()

          image.src = imageBase64

          self.gif.addFrame(image, {
            delay: self.frames[index].delay
          })

          resolve(self.appendImageToGifFrame(index + 1, -(-currentDuration - self.frames[index].delay)))
        })
      } else {
        resolve()
      }
    });
  }

  generate() {
    let self = this

    this.status = 1

    this.zip.file(self.frames[0].file).async('base64').then(base64 => {
      let imageBase64 = "data:" + self.mimeType + ';base64,' + base64,
          quality = $extension.browserItems.ugoiraQuanlity ||10

      getImageSize(imageBase64).then(size => {
        self.gif = new GIF({
          workers: 4,
          quality: quality,
          width: size.width,
          height: size.height,
          workerScript: worker
        })

        self.gif.on('progress', p => {
          self.event.dispatch('onProgress', [p])
        })

        self.gif.on('finished', blob => {
          self.status = 2

          self.event.dispatch('onFinish', [blob])
        })

        self.appendImageToGifFrame().then(() => {
          setTimeout(() => {
            self.gif.render()
          }, 120)
        })
      })
    })
  }
}

export default GifGenerator
