import Download from '@/modules/Net/Download';
import Downloader from '@/modules/Net/Downloader';
import Event from '@/modules/Event';
import MimeType from '@/modules/Util/MimeType';
import Retryer from '@/modules/Manager/Retryer';
import formatName from '@/modules/Util/formatName';

/**
 * @class Post
 * @extends {Event}
 * @property context
 * @property filename
 * @property zips
 */
export default class Post extends Event {

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
    illustrationKeepPageNumber = false,
    processors = 2
  }) {
    this.splitSize = splitSize;
    this.illustrationRenameFormat = illustrationRenameFormat
    this.illustrationImageRenameFormat = illustrationImageRenameFormat;
    this.pageNumberStartWithOne = pageNumberStartWithOne;
    this.illustrationKeepPageNumber = illustrationKeepPageNumber;
    this.processors = processors

    return this;
  }

  init() {
    this.chunks = [];
    this.filename = null;
    this.zips = null;

    let startIndex = 0;

    while (startIndex <= this.pagesNumber() - 1) {
      let chunk = {},
          endIndex = startIndex + this.splitSize - 1;

      chunk.start = startIndex;

      if (endIndex >= this.pagesNumber()) {
        endIndex = this.pagesNumber() - 1;
      }

      chunk.end = endIndex;

      this.chunks.push(chunk);

      startIndex = chunk.end + 1;
    }

    if (!this.illustrationImageRenameFormat ||
        this.illustrationImageRenameFormat.indexOf('{pageNum}') < 0
    ) {
      this.illustrationImageRenameFormat += '{pageNum}';
    }
  }

  getUserId() {
    return this.context.userId
  }

  getUserName() {
    return this.context.userName
  }

  getId() {
    return this.context.postId
  }

  getImages() {
    return this.context.images
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
    return formatName(this.illustrationRenameFormat, this.context, this.getId()) + '.zip';
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
    return this.context.images.length;
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
          this.dispatch('progress', [{ progress: loadedLength / totalLength }, context])
        });

        download.addListener('onerror', error => {
          console.log(error);
          reject();
        });

        download.addListener('onfinish', blob => {
          let pageNum = extraOptions.pageNum || 0;

          this.context.pageNum = pageNum;

          let format = null;

          if (this.illustrationKeepPageNumber) {
            format = this.illustrationImageRenameFormat.replace(/#/g, '');
          } else {
            format = this.illustrationImageRenameFormat.replace(/#.*#/g, '');
          }

          let filename = formatName(format, this.context, pageNum) + '.' + MimeType.getExtenstion(download.getResponseHeader('Content-Type'));

          this.dispatch('download-finish', [{ blob, filename }, context]);

          resolve();
        });

        download.download();
      });
    });
  }

  downloadChunk(context) {
    let downloader = new Downloader({ processors: this.processors });
    let zip = new JSZip();

    this.context.images.forEach(image => {
      downloader.appendFile(image);
    });

    downloader.addListener('progress', progress => {
      this.dispatch('download-progress', [progress, context]);
    });

    downloader.addListener('item-error', error => {
      this.dispatch('download-error', error);
    });

    downloader.addListener('item-finish', ({blob, index, download}) => {
      let pageNum = index + (this.pageNumberStartWithOne ? 1 : 0);
      let filename = null;

      this.context.pageNum = pageNum;

      filename = formatName(
        this.illustrationImageRenameFormat.replace(/#/g, ''),
        this.context,
        pageNum
      );

      filename += '.' + MimeType.getExtenstion(download.getResponseHeader('Content-Type'))

      /**
       * Fix jszip date issue which jszip will save the UTC time as the local time to files in zip
       */
      let now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

      zip.file(filename, blob, {
        date: now
      });
    });

    downloader.addListener('finish', () => {
      zip.generateAsync({ type: 'blob' }).then(blob => {
        this.dispatch('download-finish', [{blob, filename: this.getFilename()}, context]);
      });
    });

    downloader.download();
  }
}
