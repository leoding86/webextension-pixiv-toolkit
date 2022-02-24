import Download from '@/modules/Net/Download';
import Event from '@/modules/Event';
import MimeType from '@/modules/Util/MimeType';
import Retryer from '@/modules/Manager/Retryer';
import formatName from '@/modules/Util/formatName';
import FilesDownloader from '@/content_scripts/FilesDownloader';

/**
 * @class Episode
 * @extends {Event}
 * @property context
 * @property chunks
 * @property filename
 * @property zips
 */
class Episode extends FilesDownloader {

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
    splitSize = 1000,
    renameFormat,
    imageRenameFormat,
    pageNumberStartWithOne = false,
    pageNumberLength,
    processors = 2,
    pack = true
  }) {
    this.splitSize = splitSize;
    this.renameFormat = renameFormat
    this.imageRenameFormat = imageRenameFormat;
    this.pageNumberStartWithOne = pageNumberStartWithOne;
    this.pageNumberLength = pageNumberLength;
    this.processors = processors;
    this.pack = pack;
    this.relativePath = '';

    this.addContext('startPageNum', this.getPageNum(1));
    this.addContext('lastPageNum', this.getPageNum(this.context.pages.length));

    return this;
  }

  init() {
    this.relativePath = formatName(this.renameFormat, this.context, this.getId());
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

    if (!self.imageRenameFormat ||
        self.imageRenameFormat.indexOf('{pageNum}') < 0
    ) {
      self.imageRenameFormat += '{pageNum}';
    }
  }

  /**
   * Add context
   * @param {string} key
   * @param {any} value
   */
  addContext(key, value) {
    this.context[key] = value;
  }

  getId() {
    return this.context.id
  }

  getUniqueId() {
    return `pixiv-comic-episode:${this.getId()}`;
  }

  getImages() {
    return this.context.pages
  }

  getThumb() {
    return this.getImages()[0];
  }

  getTitle() {
    return this.context.title;
  }

  isR() {
    return false;
  }

  /**
   * Check if there is a single in the set
   *
   * @returns {Boolean}
   */
  isSingle() {
    return false;
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
   * Get page number
   * @param {number} pageNum First page is based 1
   * @returns {number}
   */
  getPageNum(pageNum) {
    return pageNum - (this.pageNumberStartWithOne ? 0 : 1);
  }

  /**
   * @override
   * @inheritdoc
   * @param {number} index
   * @returns {string}
   */
  getFileUrlByIndex(index) {
    return this.context.pages[index];
  }

  /**
   * @inheritdoc
   * @param {number} index
   * @returns {string}
   */
  getSingleFilename(index) {
    let pageNum = index + (this.pageNumberStartWithOne ? 1 : 0);

    this.context.pageNum = this.getPageNumberString(
      pageNum, this.context.pages.length, this.pageNumberLength
    );

    return formatName(
      this.imageRenameFormat.replace(this.isSingle() ? /#.*#/g: /#/g, ''),
      this.context,
      pageNum
    );
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  getPackedFilename() {
    return formatName(this.renameFormat, this.context, this.getId());
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

          let format = this.imageRenameFormat.replace(/#.*#/g, '');

          let filename = formatName(format, this.context, pageNum) + '.' + MimeType.getExtenstion(download.getResponseHeader('Content-Type'));

          this.dispatch('download-finish', [{ blob, filename }, context]);

          resolve();
        });

        download.download();
      });
    });
  }
}

export default Episode;
