import Event from '@/modules/Event'
import getImageSize from '@/modules/Util/getImageSize'
import getCanvasFromDataURI from '@/modules/Util/getCanvasFromDataURI'

class WebMGenerator {
  constructor(zip, mimeType, frames) {
    this.status = 0
    this.mimeType = mimeType
    this.frames = frames
    this.zip = zip
    this.encoder
    this.event = new Event()
    this.duration = 0;

    this.frames.forEach(frame => {
      this.duration += parseInt(frame.delay)
    })
  }

  appendImagesToWebMFrame(size, currentIndex, currentDuration = 0) {
    let self = this;

    return new Promise(resolve => {
      let index = currentIndex || 0

      if (index < self.frames.length) {
        self.zip.file(self.frames[index].file).async('base64').then(base64 => {
          return getCanvasFromDataURI(
            "data:" + self.mimeType + ";base64," + base64,
            size
          )
        }).then(canvas => {
          self.encoder.add(canvas, self.frames[index].delay)

          resolve(self.appendImagesToWebMFrame(size, index + 1, -(-currentDuration - self.frames[index].delay)))
        })
      } else {
        if ($extension.enableExtend === true &&
          $extension.browserItems.enableWhenUnderSeconds * 100 > self.duration &&
          $extension.browserItems.extendDuration &&
          $extension.browserItems.extendDuration * 1000 > currentDuration
        ) {
          index = 0

          resolve(appendImagesToWebMFrame(size, index, -(-currentDuration - self.frames[index].delay)))
        }

        resolve()
      }
    })
  }

  generate() {
    let self = this

    this.status = 1;

    this.encoder = new Whammy.Video()

    this.encoder.on('progress', (total, index) => {
      self.event.dispatch('onProgress', [index / total])
    })

    this.zip.file(self.frames[0].file).async('base64').then(base64 => {
      return getImageSize(
        "data:" + self.mimeType + ";base64," + base64
      )
    }).then(size => {
      return self.appendImagesToWebMFrame({
        width: size.width,
        height: size.height
      })
    }).then(() => {
      try {
        self.encoder.compile(false, blob => {
          self.status = 2

          self.event.dispatch('onFinish', [blob])
        })
      } catch (e) {
        console.error(e);
      }
    })
  }
}

export default WebMGenerator
