/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 14:34:44
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 23:04:16
 * @FilePath: \webextension-pixiv-toolkit\src\content_scripts\modules\Legacy\UgoiraGenerator\WebmGenerator.js
 */
import AbstractDownloadTask from "@/options_page/modules/DownloadTasks/AbstractDownloadTask";
import AbstractGenerator from "./AbstractGenerator";
import getImageSize from '@/modules/Util/getImageSize';
import getCanvasFromDataURI from '@/modules/Util/getCanvasFromDataURI';
import MimeType from "@/modules/Util/MimeType";


class WebmGenerator extends AbstractGenerator {
  /**
  * @constructor
  */
  constructor() {
    super();

    this.status = 0
    this.frames
    this.zip
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
            "data:" + MimeType.getFileMimeType(this.frames[index].file) + ";base64," + base64,
            size
          );
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
   * @param {AbstractDownloadTask} downloadTask
   * @returns {void}
   */
  async generate(downloadTask) {
    let self = this

    this.frames = downloadTask.options.frames;
    this.zip = new JSZip();
    await this.zip.loadAsync(downloadTask.data);

    this.status = 1;

    this.encoder = new Whammy.Video()

    this.encoder.on('progress', (total, index) => {
      this.dispatchProgress(index / total);
    })

    this.zip.file(self.frames[0].file).async('base64').then(base64 => {
      return getImageSize(
        "data:" + MimeType.getFileMimeType(self.frames[0].file) + ";base64," + base64
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
          this.dispatchComplete([blob, 'video/webm']);
        })
      } catch (e) {
        console.error(e);
      }
    })
  }
}

export default WebmGenerator;
