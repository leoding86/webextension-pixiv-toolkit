import Download from '@/modules/Net/Download';
import Downloader from '@/modules/Net/Downloader'
import Event from '@/modules/Event';
import MimeType from '@/modules/Util/MimeType';
import Queue from '@/modules/Queue';
import Retryer from '@/modules/Manager/Retryer';
import formatName from '@/modules/Util/formatName';

class MangaTool extends Event {
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
    processors
  }) {
    this.splitSize = splitSize;
    this.mangaRenameFormat = mangaRenameFormat;
    this.mangaImageRenameFormat = mangaImageRenameFormat;
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

  /**
   * @param {{start: Number, end: Number}} chunk
   * @param {*} context The context used pass to downloads events
   */
  downloadChunk(chunk, context) {
    let zip = new JSZip();
    let downloader = new Downloader({ processors: this.processors });

    for (let i = chunk.start; i <= chunk.end; i++) {
      downloader.appendFile(this.context.pages[i].urls.original);
    }

    downloader.addListener('progress', progress => {
      this.dispatch('download-progress', [progress, context]);
    });

    downloader.addListener('item-error', error => {
      this.dispatch('download-error', error);
    });

    downloader.addListener('item-finish', ({blob, index, download}) => {
      let pageNum = chunk.start + index + (this.pageNumberStartWithOne ? 1 : 0);

      this.context.pageNum = pageNum;

      let filename = formatName(
        this.mangaImageRenameFormat,
        this.context,
        pageNum
      ) + '.' + MimeType.getExtenstion(download.getResponseHeader('Content-Type'));

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
        this.dispatch('download-finish', [blob, context]);
      });
    });

    downloader.download();
  }
}

export default MangaTool;
