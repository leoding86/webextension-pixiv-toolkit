import RetryTicker from '@/modules/Util/RetryTicker';
import Queue from '@/modules/Util/Queue';
import formatName from '@/modules/Util/formatName';
import Logger from '@/modules/Logger'

/**
 * @class IllustTool
 *
 * @property context
 * @property retryTicker
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
    this.retryTicker = new RetryTicker();
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
	 * @param {object} [options={}]
	 *
	 * @returns {Promise<{blob: Blob, targetName: string}>}
	 */
	downloadFile(url, options = {}) {
		let self = this,
				xhr = new XMLHttpRequest()

		return new Promise((resolve, reject) => {
			xhr.open('get', url);
			xhr.overrideMimeType('text/plain; charset=x-user-defined');
			xhr.onload = () => {
				let parts = url.match(/(\d+)\.([^.]+)$/),
						pageNum = parts[1],
						extName = parts[2];

        self.context.pageNum = pageNum;

        let filename = null;

        if (options.onRename && typeof options.onRename === 'function') {
          filename = options.onRename({
            renameFormat: self.illustrationImageRenameFormat,
            context: self.context,
            pageNum: pageNum,
            extName: extName
          });
        } else {
          filename = formatName(
            self.illustrationImageRenameFormat,
            self.context,
            pageNum
          ) + '.' + extName;
        }

				let byteArray = new Uint8Array(xhr.responseText.length)

				for (let i = 0, l = xhr.responseText.length; i < l; i++) {
					byteArray[i] = xhr.responseText.charCodeAt(i)
				}

				let blob = new Blob([byteArray], {type: 'application/octet-stream'})

				resolve({
					blob: blob,
					targetName: filename
				});
			}

			xhr.onerror = () => {
				if (!self.retryTicker.reachLimit()) {
					resolve(self.downloadFile(url));
				} else {
					self.retryTicker.reset();
					reject();
				}
			}

			xhr.onprogress = (evt) => {
				if (typeof options.onProgress === 'function') {
					options.onProgress.call(xhr, evt)
				}
			}

			Logger.notice('Save file ' + url)

			xhr.send();
		})
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
          self.illustrationImageRenameFormat,
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

      Logger.notice('save illustration image ' + url)

      xhr.send();
    });
  }
}

export default IllustTool;
