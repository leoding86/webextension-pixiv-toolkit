import Download from '@/modules/Net/Download';
import Downloader from '@/modules/Net/Downloader';
import Event from '@/modules/Event';
import MimeType from '@/modules/Util/MimeType';
import Queue from '@/modules/Queue';
import Retryer from '@/modules/Manager/Retryer';
import formatName from '@/modules/Util/formatName';

/**
 * @typedef DownloadedFile
 * @property {Blob|ArrayBuffer} data
 * @property {string} filename
 * @property {string} mimeType
 *
 * @class IllustTool
 * @extends {Event}
 * @property context
 * @property chunks
 * @property filename
 * @property zips
 */
class IllustTool extends Event {

  /**
   * @constructor
   * @param {Object} context
   */
  constructor(context) {
    super();

    this.context = context;
    this.chunks = [];
    this.filename;
    this.zips;
  }

  initOptions({
    splitSize,
    illustrationRenameFormat,
    illustrationImageRenameFormat,
    pageNumberStartWithOne = false,
    illustrationPageNumberLength,
    processors = 2,
    pack = true
  }) {
    this.splitSize = splitSize;
    this.illustrationRenameFormat = illustrationRenameFormat
    this.illustrationImageRenameFormat = illustrationImageRenameFormat;
    this.pageNumberStartWithOne = pageNumberStartWithOne;
    this.illustrationPageNumberLength = illustrationPageNumberLength;
    this.processors = processors;
    this.pack = pack;
    this.relativePath = '';

    return this;
  }

  init() {
    this.relativePath = formatName(this.illustrationRenameFormat, this.context, this.context.illustId);
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

  getThumb() {
    return this.getImages().thumb;
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
    let pageSuffix = this.chunks.length > 1 ? ('_' + this.getPageRange(chunk)) : '';
    return formatName(this.illustrationRenameFormat, this.context, this.context.illustId) + pageSuffix + '.zip';
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
   *
   * @param {{indexes: number[], extra: object}} options
   * @param {*} that
   * @returns {Promise.<DownloadedFile[], Error>}
   */
  downloadFiles({ indexes, extra = {} }, that) {
    return new Promise((resolve, reject) => {
      let files = [],
          downloader = new Downloader({ processors: this.processors });

      downloader.asBlob = false;

      /**
       * Append files that need to download
       */
      indexes.forEach(idx => {
        downloader.appendFile(this.context.pages[idx].urls.original);
      });

      downloader.addListener('progress', progress => {
        this.dispatch('download-progress', [progress, that, { selected: true }]);
      });

      downloader.addListener('item-error', error => {
        this.dispatch('download-error', error);
      });

      downloader.addListener('item-finish', ({data, index, download}) => {
        let pageNum = index + (this.pageNumberStartWithOne ? 1 : 0),
            filename = null;

        this.context.pageNum = this.getPageNumberString(pageNum);

        filename = formatName(
          this.illustrationImageRenameFormat.replace(this.isSingle() ? /#.*#/g: /#/g, ''),
          this.context,
          pageNum
        );

        let mimeType = download.getResponseHeader('Content-Type');

        filename += '.' + MimeType.getExtenstion(mimeType);

        files.push({ data, filename, mimeType });
      });

      downloader.addListener('finish', () => {
        this.dispatch('download-finish', [that, extra]);

        resolve(files);
      });

      downloader.download();
    });
  }

  /**
   * Download file
   * @param {String} url
   * @param {*} [context]
   * @param {Object} [extraOptions]
   * @returns {void}
   */
  downloadFile(url, context, extraOptions) {
    let retryer = new Retryer({ maxTime: 3 });

    retryer.start(() => {
      return new Promise((resolve, reject) => {
        let download = new Download(url, { method: 'GET' });

        download.addListener('onprogress', ({ totalLength, loadedLength }) => {
          this.dispatch('download-progress', [{ progress: loadedLength / totalLength }, context])
        });

        download.addListener('onerror', error => {
          console.log(error);
          reject();
        });

        download.addListener('onfinish', blob => {
          let pageNum = extraOptions.pageNum || 0;

          this.context.pageNum = pageNum;

          let format = this.illustrationImageRenameFormat.replace(/#.*#/g, '');

          let filename = formatName(format, this.context, pageNum) + '.' + MimeType.getExtenstion(download.getResponseHeader('Content-Type'));

          this.dispatch('download-finish', [{ blob, filename }, context]);

          resolve();
        });

        download.download();
      });
    });
  }

  /**
   * Download multiple files. The browser will popup a confirm dialog for user for asking user if
   * he/she agree to download multiple files from the website. The user MUST allow it, then the
   * browser will process the download.
   * @typedef DownloadFilesOptions
   * @property {{start: number, end: number}} range
   *
   * @param {DownloadFilesOptions} options The range number is based on 0
   * @param {any} that The context that will send back via event emit
   */
  downloadRange({
    range
  }, that) {
    let indexes = [],
        start = Math.min(range.start, range.end),
        end = Math.max(range.start, range.end);

    while (start <= end) {
      indexes.push(start);

      start++;
    }

    return this.downloadFiles({ indexes }, that);
  }

  downloadSelected(indexes, that) {
    return this.downloadFiles({ indexes, extra: { selected: true } }, that);
  }

  /**
   * Get packed file
   * @param {DownloadedFile[]} files
   * @return {Promise.<{ data: Blob, filename: string },Error>}
   */
  getPackedFile(files) {
    return new Promise((resolve, reject) => {
      let zip = new JSZip();

      /**
       * Fix jszip date issue which jszip will save the UTC time as the local time to files in zip
       */
      let now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

      files.forEach(file => {
        /**
        * Firefox related issue, cannot use blob as a given data to zip.file function
        */
        zip.file(file.filename, file.data, {
          date: now
        });
      });

      zip.generateAsync({ type: 'blob' }).then(blob => {
        resolve({
          data: blob,
          filename: formatName(this.illustrationRenameFormat, this.context, this.context.illustId) + '.zip'
        });
      }).catch(error => {
        reject(error);
      });
    });
  }

  /**
   * Format page number
   * @param {Number|String} pageNum
   * @returns {String}
   */
  getPageNumberString(pageNum) {
    if (this.illustrationPageNumberLength === 0) {
      return pageNum;
    }

    let pageNumStr = pageNum + '', pageNumberLength = 0;

    if (this.illustrationPageNumberLength > 1) {
      pageNumberLength = this.illustrationPageNumberLength;
    } else if (this.illustrationPageNumberLength === -1) {
      pageNumberLength = (this.context.pages.length + '').length;
    }

    return pageNumStr.length < pageNumberLength ?
      ('0'.repeat(pageNumberLength - pageNumStr.length) + pageNumStr) : pageNum;
  }
}

export default IllustTool;
