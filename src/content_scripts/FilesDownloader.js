import Downloader from '@/modules/Net/Downloader'
import Event from '@/modules/Event';
import MimeType from '@/modules/Util/MimeType';
import formatName from '@/modules/Util/formatName';

/**
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
   */
  getFileUrlByIndex(index) {
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
   * @param {{ indexes: number[], extra: ?any }} param
   * @param {*} that
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
        downloader.appendFile(this.getFileUrlByIndex(idx));
      });

      downloader.addListener('progress', progress => {
        this.dispatch('download-progress', [progress, that, extra]);
      });

      downloader.addListener('item-error', error => {
        this.dispatch('download-error', error);
      });

      downloader.addListener('item-finish', ({data, index, download}) => {
        let filename = this.getSingleFilename(index),
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
   * @param {{ files: DownloadedFile[] }} param
   * @return {Promise.<{ data: Blob, filename: string },Error>}
   */
  getPackedFile({ files }) {
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
          filename: this.getPackedFilename() + '.zip'
        });
      }).catch(error => {
        reject(error);
      });
    });
  }
}

export default FilesDownloader;
