import Download from '@/modules/Net/Download';
import Downloader from '@/modules/Net/Downloader';
import Event from '@/modules/Event';
import MimeType from '@/modules/Util/MimeType';
import Queue from '@/modules/Queue';
import Retryer from '@/modules/Manager/Retryer';
import formatName from '@/modules/Util/formatName';

/**
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
    processors = 2
  }) {
    this.splitSize = splitSize;
    this.illustrationRenameFormat = illustrationRenameFormat
    this.illustrationImageRenameFormat = illustrationImageRenameFormat;
    this.pageNumberStartWithOne = pageNumberStartWithOne;
    this.processors = processors

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

  downloadChunk(chunk, context) {
    let downloader = new Downloader({ processors: this.processors });
    downloader.asBlob = false;

    let zip = new JSZip();

    for (let i = chunk.start; i <= chunk.end; i++) {
      downloader.appendFile(this.context.pages[i].urls.original);
    }

    downloader.addListener('progress', progress => {
      this.dispatch('download-progress', [progress, context]);
    });

    downloader.addListener('item-error', error => {
      this.dispatch('download-error', error);
    });

    downloader.addListener('item-finish', ({data, index, download}) => {
      let pageNum = chunk.start + index + (this.pageNumberStartWithOne ? 1 : 0);
      let filename = null;

      this.context.pageNum = pageNum;

      filename = formatName(
        this.illustrationImageRenameFormat.replace(this.isSingle() ? /#.*#/g: /#/g, ''),
        this.context,
        pageNum
      );

      filename += '.' + MimeType.getExtenstion(download.getResponseHeader('Content-Type'))

      /**
       * Fix jszip date issue which jszip will save the UTC time as the local time to files in zip
       */
      let now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

      /**
       * Firefox related issue, cannot use blob as a given data to zip.file function
       */
      zip.file(filename, data, {
        date: now
      });
    });

    downloader.addListener('finish', () => {
      zip.generateAsync({ type: 'blob' }).then(blob => {
        this.dispatch('download-finish', [{blob, filename: this.getFilename(chunk)}, context]);
      }).catch(error => console.error(error));
    });

    downloader.download();
  }
}

export default IllustTool;
