import Event from '@/modules/Event'
import getImageSize from '@/modules/Util/getImageSize'
import getCanvasFromDataURI from '@/modules/Util/getCanvasFromDataURI'

/**
 * @class
 */
class WebMGenerator extends Event {
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
    this.zip = zip
    this.encoder
    this.repeat = 0;
    this.currentRepeat = 0;
  }

  /**
   * @param {Number} repeat
   */
  setRepeat(repeat) {
    this.repeat = this.currentRepeat = parseInt(repeat);
  }

  /**
   *
   * @param {{width: Number, height: Number}} size
   * @param {Number} [index=0]
   * @returns {Promise.<void>}
   */
  appendImagesToWebMFrame(size, index = 0) {
    return new Promise(resolve => {
      if (index < this.frames.length) {
        this.zip.file(this.frames[index].file).async('base64').then(base64 => {
          return getCanvasFromDataURI(
            "data:" + this.mimeType + ";base64," + base64,
            size
          )
        }).then(canvas => {
          this.encoder.add(canvas, this.frames[index].delay)

          this.dispatch('data', [this.frames.length * (this.repeat + 1), this.frames.length * (this.repeat - this.currentRepeat) + index + 1]);

          resolve(this.appendImagesToWebMFrame(size, index + 1))
        })
      } else if (this.currentRepeat > 0) {
        this.currentRepeat--;

        resolve(this.appendImagesToWebMFrame(size))
      } else {
        resolve()
      }
    })
  }

  /**
   * @returns {void}
   */
  generate() {
    let self = this

    this.status = 1;

    this.encoder = new Whammy.Video()

    this.encoder.on('progress', (total, index) => {
      self.dispatch('progress', [index / total])
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

          self.dispatch('finish', [blob])
        })
      } catch (e) {
        console.error(e);
      }
    })
  }
}

export default WebMGenerator
