/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 14:34:44
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 23:59:05
 * @FilePath: \webextension-pixiv-toolkit\src\content_scripts\modules\Legacy\UgoiraGenerator\GifGenerator.js
 */
import AbstractGenerator from "./AbstractGenerator";
import getImageSize from '@/modules/Util/getImageSize'
import worker from './GifGeneratorWorker'
import MimeType from "@/modules/Util/MimeType";

class GifGenerator extends AbstractGenerator {
  /**
  * @constructor
  */
  constructor() {
    super();

    this.status = 0;
    this.frames;
    this.gif;
    this.zip;
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
          let imageBase64 = "data:" + MimeType.getFileMimeType(this.frames[index].file) + ";base64," + base64;
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

  async generate(downloadTask) {
    this.frames = downloadTask.options.frames;
    this.zip = new JSZip();
    await this.zip.loadAsync(downloadTask.data);

    let self = this

    this.status = 1

    this.zip.file(self.frames[0].file).async('base64').then(base64 => {
      let imageBase64 = "data:" + MimeType.getFileMimeType(self.frames[0].file) + ';base64,' + base64,
        quality = $extension.browserItems.ugoiraQuanlity || 10

      getImageSize(imageBase64).then(size => {
        self.gif = new GIF({
          workers: 4,
          quality: quality,
          width: size.width,
          height: size.height,
          repeat: 0,
          workerScript: worker
        })

        self.gif.on('progress', p => {
          this.dispatchProgress(p);
        })

        self.gif.on('finished', blob => {
          self.gif.freeWorkers.forEach(worker => {
            worker.terminate();
          });

          self.status = 2

          this.dispatchComplete([blob, 'image/gif']);
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

export default GifGenerator;
