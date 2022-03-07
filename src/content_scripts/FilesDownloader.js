import Downloader from '@/modules/Net/Downloader'
import Event from '@/modules/Event';
import MimeType from '@/modules/Util/MimeType';
import formatName from '@/modules/Util/formatName';

/**
 * @typedef DownloadedFile
 * @property {Blob|ArrayBuffer} data
 * @property {string} filename
 * @property {string} mimeType
 *
 * @class
 */
class FilesDownloader extends Event {
  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * Get file url using index
   * @param {number} index
   * @param {object} extra
   */
  getFileUrlByIndex(index, extra) {
    throw new Error('FilesDownloader.getFileUrlByIndex(index: number) has not been implemented');
  }

  /**
   * Get one file's name
   * @param {number} index
   * @returns {string}
   */
  getSingleFilename(index) {
    throw new Error('FilesDownloader.getSingleFilename(index: number) has not been implemented');
  }

  /**
   * Get packed file's name
   * @returns {string}
   */
  getPackedFilename() {
    throw new Error('FilesDownloader.getPackedFilename() has not been implemented');
  }

  /**
   * Get page number string
   * @param {number} pageNum
   * @param {number} endPageNum
   * @param {number} pageNumStrLen
   * @returns {string}
   */
  getPageNumberString(pageNum, endPageNum, pageNumStrLen = 0) {
    if (pageNumStrLen === 0) {
      return pageNum;
    }

    let pageNumStr = pageNum + '', pageNumberLength = 0;

    if (pageNumStrLen > 1) {
      pageNumberLength = pageNumStrLen;
    } else if (pageNumStrLen === -1) {
      pageNumberLength = (endPageNum + '').length;
    }

    return pageNumStr.length < pageNumberLength ?
      ('0'.repeat(pageNumberLength - pageNumStr.length) + pageNumStr) : pageNum;
  }

  /**
   * Download files via giving indexes.
   * @param {{ indexes: number[], getFilenameFunc: ?Function, extra: ?any, downloaderRequestOptions: ?any }} param
   * @param {*} that
   * @returns {DownloadedFile[]}
   */
  downloadFiles({ indexes, getFilenameFunc = null, extra = {}, downloaderRequestOptions = {} }, that) {
    return new Promise((resolve, reject) => {
      let files = [],
          filesNeedDownload = [],
          downloader = new Downloader({
            processors: this.processors,
            requestOptions: downloaderRequestOptions
          });

      downloader.asBlob = false;

      /**
       * Append files that need to download
       */
      indexes.forEach(idx => {
        let fileUrl = this.getFileUrlByIndex(idx, extra);

        filesNeedDownload.push({
          url: fileUrl,
          realIndex: idx
        });

        downloader.appendFile(fileUrl, idx);
      });

      downloader.addListener('progress', progress => {
        this.dispatch('download-progress', [progress, that, extra]);
      });

      downloader.addListener('item-error', error => {
        this.dispatch('download-error', error);
      });

      downloader.addListener('item-finish', ({data, index, download, file}) => {
        let targetFile = filesNeedDownload.find(fileNeedDownload => fileNeedDownload.url === file),
            _index = targetFile !== undefined ? targetFile.realIndex : index,
            filename = (typeof getFilenameFunc == 'function') ? getFilenameFunc(_index) : this.getSingleFilename(_index),
            mimeType = download.getResponseHeader('Content-Type');

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
   * Get packed file
   * @param {{ files: DownloadedFile[], getFilenameFunc: ?Function }} param
   * @return {Promise.<{ data: Blob, filename: string },Error>}
   */
  getPackedFile({ files, getFilenameFunc = null }) {
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

      zip.generateAsync({ type: 'arraybuffer' }).then(ab => {
        resolve({
          data: ab,
          filename: ((typeof getFilenameFunc == 'function') ? getFilenameFunc() : this.getPackedFilename()) + '.zip'
        });
      }).catch(error => {
        reject(error);
      });
    });
  }
}

export default FilesDownloader;
