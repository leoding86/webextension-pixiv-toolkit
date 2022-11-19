import Download from '@/modules/Net/Download';
import Event from '@/modules/Event';

/**
 * @class
 */
class Downloader extends Event {
  /**
   * The files whichs need to be downloaded
   * @type {{file: string, seq: number|string, args: Object}[]}
   */
  files;

  /**
   * The files used for download tracking. It's as same as property files at begining or after reseting
   * @type {{file: string, seq: number|string, args: Object}[]}
   */
  downloadFiles;

  /**
   * The files can't be downloaded.
   * @type {{file: string, seq: number|string, args: Object}[]}
   */
  failedDownloadFiles;

  /**
   * @type {Download[]}
   */
  downloads;

  /**
   * @type {number}
   */
  counter = 0;

  /**
   * @constructor
   * @param {Object} arguments
   * @param {Number} [arguments.processors=1]
   * @param {Object} [requestOptions={}]
   */
  constructor({ processors = 1, requestOptions = {} }) {
    super();
    this.processors = processors;
    this.requestOptions = requestOptions;
    this.files = new Map();
    this.downloads = [];
    this.successCount = 0;
    this.progresses = [];
    this.asBlob = true;
  }

  /**
   * @override
   * @param {'start'|'progress'|'item-finish'|'finish'|'item-error'|'pause'|'abort'} eventName
   */
  dispatch(eventName, args) {
    super.dispatch(eventName, args);
  }

  removeDownloadFromCollection(download) {
    this.downloads = this.downloads.splice(this.downloads.indexOf(download), 1);
  }

  /**
   * @deprecated
   * Initialize downloader, should call it after `appendFile`
   */
  initial() {
    console.warn('This method will be deprecated later');
  }

  /**
   * @override
   * @param {'start'|'progress'|'item-finish'|'finish'|'item-error'|'pause'|'abort'} eventName
   * @param {Function} listener
   * @param {*} thisArg
   */
  addListener(eventName, listener, thisArg) {
    super.addListener(eventName, listener, thisArg);
  }

  pause() {
    this.downloads.forEach(download => {
      download.abort();
    });
  }

  reset() {
    this.progresses = [];
    this.downloadFiles = this.files;
    this.failedDownloadFiles = [];
    this.successCount = 0;
  }

  download() {
    if (this.failedDownloadFiles.length > 0) {
      this.downloadFiles = this.downloadFiles.concat(this.failedDownloadFiles);
      this.failedDownloadFiles = [];
    }

    this.downloadNext();
  }

  downloadNext() {
    let downloadFile = this.downloadFiles.shift();

    if (downloadFile) {
      if (this.downloads.length < this.processors) {
        this.downloadFile(downloadFile);
      }
    } else {
      this.dispatch('finish');
    }
  }

  downloadFile(downloadFile) {
    let download = new Download(downloadFile.file, Object.assign({ method: 'GET'}, this.requestOptions));
    download.asBlob = this.asBlob;

    /**
     * Listen download onprogress event
     */
    download.addListener('onprogress', ({totalLength, loadedLength}) => {
      this.progresses[downloadFile.seq] = loadedLength / totalLength;

      this.dispatch('progress', [{
        progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.size(),
        successCount: this.successCount,
        failCount: this.failedDownloadFiles.length
      }]);
    });

    /**
     * Listen download onfinish event
     */
    download.addListener('onfinish', (data, mimeType) => {
      this.removeDownloadFromCollection(download);

      this.successCount++;

      this.dispatch('item-finish', [{
        blob: this.asBlob ? data : null,
        data: this.asBlob ? null : data,
        args: downloadFile.args,
        download, file, mimeType
      }]);

      this.downloadNext();
    });

    /**
     * Listen download onabort event
     */
    download.addListener('onabort', () => {
      this.removeDownloadFromCollection(download);

      this.progresses[downloadFile.seq] = 0;

      /**
       * Put the downloadFile back to the downloadFiles for re-tracking it
       */
      this.downloadFiles.unshift(downloadFile);

      if (this.downloads.length === 0) {
        this.dispatch('pause');
      }
    });

    /**
     * Listen download onerror event
     */
    download.addListener('onerror', error => {
      this.removeDownloadFromCollection(download);

      this.failedDownloadFiles.push(downloadFile);
      this.progresses[downloadFile.seq] = 0;

      this.dispatch('item-error', [error]);
      this.dispatch('progress', [{
        progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.size(),
        successCount: this.successCount,
        failCount: this.failedDownloadFiles.length,
      }]);

      this.downloadNext();
    });

    /**
     * Start the download and put the instance to download collection for increasing
     * download processes
     */
    download.download();
    this.downloads.push(download);

    /**
     * Fire the download start event
     */
    this.dispatch('start');
  }

  /**
   * Download files
   * @param {string} file
   * @param {any} args This param will pass to event handle when file is downloaded
   */
  appendFile(file, args) {
    let seq = this.counter;
    this.counter++;

    let downloadData = {
      file, seq, args
    };

    this.files.push(downloadData);

    this.downloadFiles.push(downloadData);
  }
}

export default Downloader;
