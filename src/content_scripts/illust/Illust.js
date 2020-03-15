import Retryer from '@/modules/Manager/Retryer';
import Queue from '@/modules/Util/Queue';
import Download from '@/modules/Net/Download';
import formatName from '@/modules/Util/formatName';
import MimeType from '@/modules/Util/MimeType';

/**
 * @class IllustTool
 *
 * @property context
 * @property chunks
 * @property filename
 * @property zips
 */
class IllustTool {

  /**
   * @constructor
   * @param {Object} context
   */
  constructor(context) {
    this.context = context;
    this.chunks = [];
    this.filename;
    this.zips;
  }

  initOptions({
    splitSize,
    illustrationRenameFormat,
    illustrationImageRenameFormat,
    pageNumberStartWithOne = false
  }) {
    this.splitSize = splitSize;
    this.illustrationRenameFormat = illustrationRenameFormat
    this.illustrationImageRenameFormat = illustrationImageRenameFormat;
    this.pageNumberStartWithOne = pageNumberStartWithOne;

    return this;
  }

  init() {
    this.chunks = [];
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

    if (!self.illustrationImageRenameFormat ||
        self.illustrationImageRenameFormat.indexOf('{pageNum}') < 0
    ) {
      self.illustrationImageRenameFormat += '{pageNum}';
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
    return formatName(this.illustrationRenameFormat, this.context, this.context.illustId) + '_' + this.getPageRange(chunk) + '.zip';
  }

  /**
   * Check if there is a single in the set
   *
   * @returns {Boolean}
   */
  isSingle() {
    return this.pagesNumber() === 1
  }

  /**
   * Get number of pages
   *
   * @return {Number}
   */
  pagesNumber() {
    return this.context.pages.length;
  }

  /**
   * Download file
   * @param {string} url
   * @param {object} [options]
   * @param {function} [options.onProgress]
   * @param {function} [options.onRename]
   * @param {object} [options.extraOptions]
   * @param {number} [options.extraOptions.pageNum]
   * @returns {Promise<{data: Uint8Array, type: string, filename: string}>}
   */
  downloadFile(url, { onProgress = null, onRename = null, extraOptions = {} }) {
    let retryer = new Retryer({ maxTime: 3 });

    return retryer.start(retryer => {
      return new Promise((resolve, reject) => {
        let download = new Download(url, { method: 'GET' });

        download.addListener('onprogress', ({ totalLength, loadedLength }) => {
          if (typeof onProgress === 'function') {
            onProgress.call(download, { totalLength, loadedLength });
          }
        });

        download.addListener('onerror', error => {
          console.log(error);
          reject();
        });

        download.addListener('onfinish', blob => {
          this.context.pageNum = extraOptions.pageNum || 0;

          let filename = null;

          if (onRename && typeof onRename === 'function') {
            filename = onRename({
              extName: MimeType.getExtenstion(download.getResponseHeader('Content-Type'))
            });
          } else {
            filename = formatName(
              this.illustrationImageRenameFormat,
              this.context,
              pageNum
            ) + '.' + extName;
          }

          resolve({
            blob: blob,
            filename: filename
          });
        });

        download.download();
      });
    });
  }

  downloadChunk(chunk, listeners) {
    let self = this;
    let zip = new JSZip();
    let queue = new Queue();

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
      let pageNum = pageIndex - 0 + (self.pageNumberStartWithOne ? 1 : 0);

      return this.downloadFile(url, {
        onRename({extName}) {
          return formatName(
            self.illustrationImageRenameFormat.replace(/#/g, ''),
            self.context,
            pageNum
          ) + '.' + extName;
        },

        extraOptions: {
          pageNum
        }
      }).then(result => {
        /**
         * Fix jszip date issue which jszip will save the UTC time as the local time to files in zip
         */
        let now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        zip.file(result.filename, result.blob, {
          date: now
        });

        return Promise.resolve();
      }).catch(error => {
        console || console.error(error);
      });
    });
  }
}

export default IllustTool;
