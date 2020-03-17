import Event from '@/modules/Event'
import getImageSize from '@/modules/Util/getImageSize'
import worker from './GifGeneratorWorker'

/**
 * @class
 */
class GifGenerator extends Event {
  /**
   * @constructor
   * @param {*} zip
   * @param {String} mimeType
   * @param {Array} frames
   */
  constructor(zip, mimeType, frames) {
    super();

    this.status = 0
    this.mimeType = mimeType
    this.frames = frames
    this.gif
    this.zip = zip
    this.repeat = 0;
    this.currentRepeat = 0;
  }

  /**
   * @param {Number} repeat
   */
  setRepeat(repeat) {
    this.repeat = this.currentRepeat = parseInt(repeat);
  }

  appendImageToGifFrame(index = 0) {
    return new Promise(resolve => {
      if (index < this.frames.length) {


        this.zip.file(this.frames[index].file).async('base64').then(base64 => {
          let imageBase64 = "data:" + this.mimeType + ";base64," + base64;
          let image = new Image();

          image.src = imageBase64

          this.gif.addFrame(image, {
            delay: this.frames[index].delay
          })

          this.dispatch('data', [this.frames.length * (this.repeat + 1), this.frames.length * (this.repeat - this.currentRepeat) + index + 1]);

          resolve(this.appendImageToGifFrame(index + 1))
        })
      } else if (this.currentRepeat > 0) {
        this.currentRepeat--;

        resolve(this.appendImageToGifFrame());
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
          self.dispatch('progress', [p])
        })

        self.gif.on('finished', blob => {
          self.gif.freeWorkers.forEach(worker => {
            worker.terminate();
          });

          self.status = 2

          self.dispatch('finish', [blob])
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
