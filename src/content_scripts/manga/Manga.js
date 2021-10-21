import formatName from '@/modules/Util/formatName';
import FilesDownloader from '@/content_scripts/FilesDownloader';

class MangaTool extends FilesDownloader {
  constructor(context) {
    super();
    this.context = context;
    this.chunks = [];
    this.filename;
    this.zips;
  }

  initOptions({
    splitSize,
    mangaRenameFormat,
    mangaImageRenameFormat,
    pageNumberStartWithOne,
    mangaPageNumberLength,
    processors
  }) {
    this.splitSize = splitSize;
    this.mangaRenameFormat = mangaRenameFormat;
    this.mangaImageRenameFormat = mangaImageRenameFormat;
    this.pageNumberStartWithOne = pageNumberStartWithOne || false;
    this.mangaPageNumberLength = mangaPageNumberLength;
    this.processors = processors

    /**
     * The relativePath is the folder name when pack files setting is disabled or
     * the filename of the pack file without pages range when the setting is enable
     * @type {string}
     */
    this.relativePath = '';

    return this;
  }

  init() {
    this.chunks = [];
    this.filename = null;
    this.zips = null;
    this.relativePath = formatName(this.mangaRenameFormat, this.context, this.context.illustId);

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

  getThumb() {
    return this.getImages().thumb;
  }

  getTitle() {
    return this.context.illustTitle
  }

  isR() {
    return !!this.context.r
  }

  /**
   * @inheritdoc
   * @param {number} index
   * @param {{start: number, end: number}} chunk
   * @returns {Function}
   */
  getSingleFilenameFunc(chunk) {
    return index => {
      let pageNum = index + chunk.start + (this.pageNumberStartWithOne ? 1 : 0);

      this.context.pageNum = this.getPageNumberString(
        pageNum, this.context.pages.length, this.mangaPageNumberLength
      );

      return formatName(this.mangaImageRenameFormat, this.context, pageNum);
    };
  }

  /**
   * @inheritdoc
   * @param {{start: number, end: number}} chunk
   * @returns {Function}
   */
  getPackedFilenameFunc(chunk) {
    return () => {
      return this.relativePath + '_' + this.getPageRange(chunk);
    };
  }

  /**
   *
   * @param {{start: number, end: number}} chunk
   * @returns {string}
   */
  getPageRange(chunk) {
    let offset = this.pageNumberStartWithOne ? 1 : 0;
    let start = parseInt(chunk.start) + offset,
        end = parseInt(chunk.end) + offset;

    if (start === end) {
      return start;
    } else {
      return `${start}-${end}`;
    }
  }

  /**
   * @override
   * @inheritdoc
   * @param {number} index
   * @returns {string}
   */
  getFileUrlByIndex(index) {
    return this.context.pages[index].urls.original;
  }

  /**
   * Download files
   * @param {{start: number, end: number}} chunk
   * @param {*} that The context used pass to downloads events
   * @returns {Promise.<import('@/content_scripts/FilesDownloader').DownloadedFile, Error>}
   */
  downloadChunk(chunk, that) {
    let indexes = [],
        start = Math.min(chunk.start, chunk.end),
        end = Math.max(chunk.start, chunk.end);

    while (start <= end) {
      indexes.push(start);
      start++;
    }

    return this.downloadFiles({
      indexes,
      getFilenameFunc: this.getSingleFilenameFunc(chunk),
      extra: {
        chunk
      }
    }, that);
  }

  /**
   * Get packed file of chunk
   * @param {import('@/content_scripts/FilesDownloader').DownloadedFile[]}
   * @param {{start: number, end: number}} chunk
   * @returns {Promise.<any, Error>}
   */
  getPackedChunkFile(files, chunk) {
    return this.getPackedFile({
      files,
      getFilenameFunc: this.getPackedFilenameFunc(chunk)
    });
  }
}

export default MangaTool;
