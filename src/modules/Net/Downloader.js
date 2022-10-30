import Download from '@/modules/Net/Download';
import Event from '@/modules/Event';
import Queue from '@/modules/Queue';
import { RuntimeError } from '@/errors';

/**
 * @class
 */
class Downloader extends Event {
  /**
   * @type {Queue}
   */
  queue;

  /**
   * @type {Download[]}
   */
  downloads;

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
    this.files = [];
    this.downloads = [];
    this.successIndexes = [];
    this.failIndexes = [];
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
   * Initialize downloader, should call it after `appendFile`
   */
  initial() {
    this.queue = new Queue();
    this.queue.setProcessors(this.processors);
    this.queue.onDone = () => {
      this.dispatch('finish');
    };

    this.queue.onPaused = () => {
      this.dispatch('paused');
    };

    this.files.forEach((file, index) => {
      this.queue.add({file, index});
    });
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
    this.queue.pause();
  }

  download() {
    if (this.queue.queuing) {
      this.queue.cancelPause();
      return;
    }

    this.queue.start(({file, index}) => {
      return new Promise((resolve, reject) => {
        let download = new Download(file, Object.assign({ method: 'GET' }, this.requestOptions));

        /**
         * Append download to collection
         */
        this.downloads.push(download);

        download.asBlob = this.asBlob;

        download.addListener('onprogress', ({totalLength, loadedLength}) => {
          this.progresses[index] = loadedLength / totalLength;

          this.dispatch('progress', [{
            progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.length,
            successCount: this.successIndexes.length,
            failCount: this.failIndexes.length
          }]);
        });

        download.addListener('onfinish', (data, mimeType) => {
          this.removeDownloadFromCollection(download);

          this.successIndexes.push(index);

          this.dispatch('item-finish', [{
            blob: this.asBlob ? data : null,
            data: this.asBlob ? null : data,
            index, download, file, mimeType
          }]);

          resolve();
        });

        download.addListener('onerror', error => {
          this.removeDownloadFromCollection(download);

          this.failIndexes.push(index);
          this.progresses[index] = 0;

          this.dispatch('item-error', [error]);
          this.dispatch('progress', [{
            progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.length,
            successCount: this.successIndexes.length,
            failCount: this.failIndexes.length
          }]);

          reject();
        });

        download.download();
      });
    });

    this.dispatch('start');
  }

  /**
   * Download files
   * @param {String} file
   */
  appendFile(file) {
    this.files.push(file);
  }
}

export default Downloader;
