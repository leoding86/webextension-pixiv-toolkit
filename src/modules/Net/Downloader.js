import Download from '@/modules/Net/Download';
import Event from '@/modules/Event';
import browser from '../Extension/browser';

/**
 * @class
 */
class Downloader extends Event {
  /**
   * The files whichs need to be downloaded
   * @type {{file: string, seq: number|string, args: Object}[]}
   */
  files = [];

  /**
   * The files used for download tracking. It's as same as property files at begining or after reseting
   * @type {{file: string, seq: number|string, args: Object}[]}
   */
  downloadFiles = [];

  /**
   * The files can't be downloaded.
   * @type {{file: string, seq: number|string, args: Object}[]}
   */
  failedDownloadFiles = [];

  /**
   * @type {Download[]}
   */
  downloadFilePorts = [];

  /**
   * @type {number}
   */
  counter = 0;

  /**
   * @type {boolean}
   */
  paused = false;

  /**
   * @constructor
   * @param {Object} arguments
   * @param {Number} [arguments.processors=1]
   * @param {Object} [requestOptions={}]
   * @param {CallableFunction} [beforeItemDownload]
   */
  constructor({
    processors = 1,
    requestOptions = {},
    beforeItemDownload = undefined,
    afterItemDownload = undefined
  }) {
    super();
    this.processors = processors;
    this.requestOptions = requestOptions;
    this.beforeItemDownload = beforeItemDownload;
    this.afterItemDownload = afterItemDownload;
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
    this.downloadFilePorts = this.downloadFilePorts.splice(this.downloadFilePorts.indexOf(download), 1);
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
    this.paused = true;

    this.downloadFilePorts.forEach(downloadFilePort => {
      downloadFilePort.postMessage({ action: 'abort' });
    });
  }

  reset() {
    this.progresses = [];
    this.downloadFiles = this.files;
    this.failedDownloadFiles = [];
    this.successCount = 0;
  }

  download() {
    this.paused = false;

    if (this.failedDownloadFiles.length > 0) {
      this.downloadFiles = this.downloadFiles.concat(this.failedDownloadFiles);
      this.failedDownloadFiles = [];
    }

    this.downloadNext();
  }

  downloadNext() {
    if (this.paused) {
      return;
    }

    let downloadFile = this.downloadFiles.shift();

    if (downloadFile) {
      if (this.downloadFilePorts.length < this.processors) {
        this.downloadFile(downloadFile);
      }
    } else {
      this.dispatch('finish');
    }
  }

  downloadFile(downloadFile) {
    let requestOptions = Object.assign({ method: 'GET' }, this.requestOptions);

    if (this.beforeItemDownload && typeof this.beforeItemDownload === 'function') {
      this.beforeItemDownload.call(this, {
        requestOptions,
        downloadFile
      });
    }

    const downloadFilePort = browser.runtime.connect({
      name: 'DownloadFile',
    });

    downloadFilePort.onMessage.addListener(message => {
      if (message.event === 'progress') {
        const { totalLength, loadedLength } = message.data.progress;
        this.progresses[downloadFile.seq] = loadedLength / totalLength;

        this.dispatch('progress', [{
          progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue, 0) / this.files.length,
          successCount: this.successCount,
          failCount: this.failedDownloadFiles.length
        }]);
      } else if (message.event === 'error') {
        this.removeDownloadFromCollection(downloadFilePort);
        const { error = errorMessage } = message.data;

        this.failedDownloadFiles.push(downloadFile);
        this.progresses[downloadFile.seq] = 0;

        console.error(error);

        this.dispatch('item-error', [new Error(errorMessage)]);
        this.dispatch('progress', [{
          progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.length,
          successCount: this.successCount,
          failCount: this.failedDownloadFiles.length,
        }]);

        this.downloadNext();
      } else if (message.event === 'complete') {
        const { data, mimeType } = message.data;

        fetch(data).then(response => {
          response.blob().then(data => {
            this.removeDownloadFromCollection(downloadFilePort);

            const itemFinishData = {
              blob: this.asBlob ? data : null,
              data: this.asBlob ? null : data,
              args: downloadFile.args,
              downloadFilePort,
              mimeType
            };

            if (this.afterItemDownload && typeof this.afterItemDownload === 'function') {
              const afterItemDownloadResult = this.afterItemDownload.call(this, {
                itemFinishData,
                downloadFile
              });

              if (afterItemDownloadResult instanceof Promise) {
                afterItemDownloadResult.then(() => {
                  this.successCount++;
                  this.dispatch('item-finish', [itemFinishData]);
                  this.downloadNext();
                }).catch((error) => {
                  this.dispatch('item-error', [error]);
                });

                return;
              }
            }

            this.successCount++;
            this.dispatch('item-finish', [itemFinishData]);
            this.downloadNext();
          });
        });
      } else if (message.event === 'abort') {
        this.removeDownloadFromCollection(downloadFilePort);
        this.progresses[downloadFile.seq] = 0;

        /**
         * Put the downloadFile back to the downloadFiles for re-tracking it
         */
        this.downloadFiles.unshift(downloadFile);

        if (this.downloadFilePorts.length === 0) {
          this.dispatch('pause');
        }
      }
    });

    // let download = new Download(downloadFile.file, requestOptions);
    // download.asBlob = this.asBlob;

    /**
     * Listen download onprogress event
     */
    // download.addListener('onprogress', ({totalLength, loadedLength}) => {
    //   this.progresses[downloadFile.seq] = loadedLength / totalLength;

    //   this.dispatch('progress', [{
    //     progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.length,
    //     successCount: this.successCount,
    //     failCount: this.failedDownloadFiles.length
    //   }]);
    // });

    /**
     * Listen download onfinish event
     */
    // download.addListener('onfinish', (data, mimeType) => {
    //   this.removeDownloadFromCollection(download);

    //   const itemFinishData = {
    //     blob: this.asBlob ? data : null,
    //     data: this.asBlob ? null : data,
    //     args: downloadFile.args,
    //     download,
    //     mimeType
    //   };

    //   if (this.afterItemDownload && typeof this.afterItemDownload === 'function') {
    //     const afterItemDownloadResult = this.afterItemDownload.call(this, {
    //       itemFinishData,
    //       downloadFile
    //     });

    //     if (afterItemDownloadResult instanceof Promise) {
    //       afterItemDownloadResult.then(() => {
    //         this.successCount++;
    //         this.dispatch('item-finish', [itemFinishData]);
    //         this.downloadNext();
    //       }).catch((error) => {
    //         this.dispatch('item-error', [error]);
    //       });

    //       return;
    //     }
    //   }

    //   this.successCount++;
    //   this.dispatch('item-finish', [itemFinishData]);
    //   this.downloadNext();
    // });

    /**
     * Listen download onabort event
     */
    // download.addListener('onabort', () => {
    //   this.removeDownloadFromCollection(download);

    //   this.progresses[downloadFile.seq] = 0;

    //   /**
    //    * Put the downloadFile back to the downloadFiles for re-tracking it
    //    */
    //   this.downloadFiles.unshift(downloadFile);

    //   if (this.downloads.length === 0) {
    //     this.dispatch('pause');
    //   }
    // });

    /**
     * Listen download onerror event
     */
    // download.addListener('onerror', error => {
    //   this.removeDownloadFromCollection(download);

    //   this.failedDownloadFiles.push(downloadFile);
    //   this.progresses[downloadFile.seq] = 0;

    //   console.error(error);

    //   this.dispatch('item-error', [error]);
    //   this.dispatch('progress', [{
    //     progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.length,
    //     successCount: this.successCount,
    //     failCount: this.failedDownloadFiles.length,
    //   }]);

    //   this.downloadNext();
    // });

    /**
     * Start the download and put the instance to download collection for increasing
     * download processes
     */
    this.downloadFilePorts.push(downloadFilePort);
    // download.download();
    downloadFilePort.postMessage({
      action: 'download',
      url: downloadFile.file,
      options: requestOptions
    });

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
