import RetryTicker from '@/modules/Util/RetryTicker';
import Queue from '@/modules/Util/Queue';
import formatName from '@/modules/Util/formatName';
import Logger from '@/modules/Logger'

class MangaTool {
  constructor(context) {
    this.context = context;
    this.retryTicker = new RetryTicker();
    this.chunks = [];
    this.filename;
    this.zips;
  }

  initOptions({
    splitSize,
    mangaRenameFormat,
    mangaImageRenameFormat,
    pageNumberStartWithOne
  }) {
    this.splitSize = splitSize;
    this.mangaRenameFormat = mangaRenameFormat;
    this.mangaImageRenameFormat = mangaImageRenameFormat;
    this.pageNumberStartWithOne = pageNumberStartWithOne;

    return this;
  }

  init() {
    this.chunks = [];
    this.retryTicker.reset();
    this.filename = null;
    this.zips = null;

    let self = this,
        startIndex = 0;

    while (startIndex <= self.context.pages.length - 1) {
      let chunk = {},
          endIndex = startIndex + self.splitSize - 1;

      chunk.start = startIndex;

      if (endIndex >= self.context.pages.length) {
        endIndex = self.context.pages.length - 1;
      }

      chunk.end = endIndex;

      self.chunks.push(chunk);

      startIndex = chunk.end + 1;
    }

    if (!self.mangaImageRenameFormat ||
        self.mangaImageRenameFormat.indexOf('{pageNum}') < 0
    ) {
      self.mangaImageRenameFormat += '{pageNum}';
    }
  }

  getUserId() {
    return this.context.userId
  }

  getUserName() {
    return this.context.userName
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

  getPageRange(chunk) {
    if (chunk.start == chunk.end) {
      return parseInt(chunk.start);
    } else {
      return (parseInt(chunk.start + 1)) + '-' + (parseInt(chunk.end + 1));
    }
  }

  getFilename(chunk) {
    return formatName(this.mangaRenameFormat, this.context, this.context.illustId) + '_' + this.getPageRange(chunk) + '.zip';
  }

  downloadChunk(chunk, listeners) {
    let self = this,
        zip = new JSZip(),
        queue = new Queue(),
        xhr = new XMLHttpRequest();

    queue.onItemComplete = () => {
      listeners.onItemComplete(queue);
    };

    queue.onItemFail = () => {
      listeners.onItemFail(queue);
    };

    queue.onDone = () => {
      zip.generateAsync({
        type: 'blob',
      }).then(blob => {
        listeners.onDone(blob)
      });
    }

    for (let i = chunk.start; i <= chunk.end; i++) {
      queue.add({
        url: self.context.pages[i].urls.original,
        pageIndex: i
      });
    }

    queue.start(({url, pageIndex}) => {
      return new Promise((resolve) => {
        self.saveImage({xhr, url, zip, pageIndex}).then(() => {
          resolve();
        });
      });
    });
  }

  saveImage({xhr, url, zip, pageIndex}) {
    let self = this;

    return new Promise((resolve, reject) => {
      xhr.open('get', url);
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
      xhr.onload = () => {
        let parts = url.match(/(\d+)\.([^.]+)$/),
            pageNum = pageIndex - 0 + (self.pageNumberStartWithOne ? 1 : 0),
            extName = parts[2];

        self.context.pageNum = pageNum;

        let filename = formatName(
          self.mangaImageRenameFormat,
          self.context,
          pageNum
        ) + '.' + extName;

        /**
         * Fix jszip date issue which jszip will save the UTC time as the local time to files in zip
         */
        let now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        zip.file(filename, xhr.responseText, {
          binary: true,
          date: now
        });

        resolve();
      }

      xhr.onerror = () => {
        if (!self.retryTicker.reachLimit()) {
          resolve(self.saveImage(xhr, url, zip));
        } else {
          self.retryTicker.reset();
          reject();
        }
      }

      Logger.notice('save manga image ' + url)

      xhr.send();
    });
  }
}

export default MangaTool;
