import Event from '@/modules/Event'
import UPNG from 'upng-js';
import getImageSize from '@/modules/Util/getImageSize';
import getCanvasFromDataURI from '@/modules/Util/getCanvasFromDataURI';

class APngGenerator {
  constructor(zip, mimeType, frames) {
    this.status = 0;
    this.zip = zip;
    this.mimeType = mimeType;
    this.frames = frames;
    this.event = new Event();
    this.imagesData = [];
    this.delays = [];
  }

  getImagesData(size, index = 0) {
    let self = this;

    return new Promise(resolve => {
      if (index < self.frames.length) {
        self.zip.file(self.frames[index].file).async('base64').then(b64 => {
          return getCanvasFromDataURI(
            "data:" + self.mimeType + ";base64," + b64,
            size
          );
        }).then(canvas => {
          self.imagesData.push(canvas.getContext('2d').getImageData(0, 0, size.width, size.height).data.buffer);
          self.delays.push(self.frames[index].delay);

          resolve(self.getImagesData(size, index + 1));
        });
      } else {
        resolve();
      }
    });
  }

  generate() {
    let self = this;

    this.status = 1;

    this.event.dispatch("onStart");

    this.zip.file(this.frames[0].file).async('base64').then(b64 => {
      let imageBase64 = "data:" + self.mimeType + ';base64,' + b64;

      getImageSize(imageBase64).then(size => {
        self.getImagesData(size).then(() => {
          let png = UPNG.encode(self.imagesData, size.width, size.height, 0, self.delays);

          this.status = 2;
          self.event.dispatch('onFinish', [png]);
        });
      });
    });
  }
}

export default APngGenerator;
