import Download from '@/modules/Net/Download';
import Event from '@/modules/Event';
import Queue from '@/modules/Queue';

/**
 * @class
 */
class Downloader extends Event {
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
    this.successIndexes = [];
    this.failIndexes = [];
    this.progresses = [];
    this.queue = null;
    this.asBlob = true;
  }

  /**
   * @override
   * @param {'start'|'progress'|'item-finish'|'finish'|'item-error'} eventName
   */
  dispatch(eventName, args) {
    super.dispatch(eventName, args);
  }

  /**
   * @override
   * @param {'start'|'progress'|'item-finish'|'finish'|'item-error'} eventName
   * @param {Function} listener
   * @param {*} thisArg
   */
  addListener(eventName, listener, thisArg) {
    super.addListener(eventName, listener, thisArg);
  }

  abort() {
    this.queue.abort();
  }

  download() {
    this.queue = new Queue();
    this.queue.setProcessors(this.processors);

    this.queue.onDone = () => {
      this.dispatch('finish');
    };

    this.files.forEach((file, index) => {
      this.queue.add({file, index});
    });

    this.queue.start(({file, index}) => {
      return new Promise((resolve, reject) => {
        let download = new Download(file, Object.assign({ method: 'GET' }, this.requestOptions));

        download.asBlob = this.asBlob;

        download.addListener('onprogress', ({totalLength, loadedLength}) => {
          this.progresses[index] = loadedLength / totalLength;

          this.dispatch('progress', [{
            progress: this.progresses.reduce((previousValue, currentValue) => previousValue + currentValue) / this.files.length,
            successCount: this.successIndexes.length,
            failCount: this.failIndexes.length
          }]);
        });

        download.addListener('onfinish', data => {
          this.successIndexes.push(index);

          this.dispatch('item-finish', [{blob: this.asBlob ? data : null, data: this.asBlob ? null : data, index, download, file}]);

          resolve();
        });

        download.addListener('onerror', error => {
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
  }

  /**
   * Download files
   * @param {String} file
   */
  appendFile(file) {
    this.files.push(file)
  }
}

export default Downloader;
