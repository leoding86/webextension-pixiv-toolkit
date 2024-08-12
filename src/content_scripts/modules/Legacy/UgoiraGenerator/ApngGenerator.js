/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 14:34:57
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 23:01:49
 * @FilePath: \webextension-pixiv-toolkit\src\content_scripts\modules\Legacy\UgoiraGenerator\ApngGenerator.js
 */
import MimeType from "@/modules/Util/MimeType";
import AbstractGenerator from "./AbstractGenerator";
import ApngGeneratorWorker from '@/modules/Workers/APngGenerator.worker';
import getImageSize from '@/modules/Util/getImageSize';
import getCanvasFromDataURI from "@/modules/Util/getCanvasFromDataURI";

class ApngGenerator extends AbstractGenerator {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.status = 0;
    this.zip;
    this.mimeType;
    this.frames;
    this.imagesData = [];
    this.delays = [];
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
   * @param {{width: Number, height: Number}} size
   * @param {Number} [index=0]
   * @returns {Promise.<void>}
   */
  getImagesData(size, index = 0) {
    return new Promise(resolve => {
      if (index < this.frames.length) {
        this.zip.file(this.frames[index].file).async('base64').then(b64 => {
          return getCanvasFromDataURI(
            "data:" + MimeType.getFileMimeType(this.frames[index].file) + ";base64," + b64,
            size
          );
        }).then(canvas => {
          this.imagesData.push(canvas.getContext('2d').getImageData(0, 0, size.width, size.height).data.buffer);
          this.delays.push(this.frames[index].delay);

          this.dispatch('data', [this.frames.length * (this.repeat + 1), this.frames.length * (this.repeat - this.currentRepeat) + index + 1]);

          resolve(this.getImagesData(size, index + 1));
        });
      } else if (this.currentRepeat > 0) {
        this.currentRepeat--;

        resolve(this.getImagesData(size));
      } else {
        resolve();
      }
    });
  }

  /**
   * @returns {void}
   */
  async generate(downloadTask) {
    let self = this;

    this.frames = downloadTask.options.frames;
    this.zip = new JSZip();
    await this.zip.loadAsync(downloadTask.data);
    this.status = 1;

    this.dispatch("start");

    this.zip.file(this.frames[0].file).async('base64').then(b64 => {
      let imageBase64 = "data:" + MimeType.getFileMimeType(this.frames[0].file) + ';base64,' + b64;

      getImageSize(imageBase64).then(size => {
        self.getImagesData(size).then(() => {
          let worker = new ApngGeneratorWorker();
          worker.postMessage({
            imagesData: self.imagesData,
            size: size,
            delays: self.delays
          });

          worker.onmessage = event => {
            if (event.data.progress) {
              self.dispatchProgress(event.data.progress.currentProgress / event.data.progress.totalProgress)
            } else if (event.data.arrayBuffer) {
              self.status = 2;
              self.dispatchComplete([new Blob([event.data.arrayBuffer], {type: 'image/apng'}), 'image/apng']);
            }
          };
        });
      });
    });
  }
}

export default ApngGenerator;
