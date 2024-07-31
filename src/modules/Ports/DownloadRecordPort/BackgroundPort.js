import { app } from '@/background/Application';
import DownloadRecordPort from './DownloadRecordPort';
import DownloadRecordRepo from '@/repositories/DownloadRecord';

export default class BackgroundPort extends DownloadRecordPort {
  static instance;

  constructor() {
    super();

    this.downloadRecordRepo = new DownloadRecordRepo({ max: app().settings.maxDownloadRecords });
  }

  /**=
   * @returns {BackgroundPort}
   */
  static getInstance(port) {
    if (!BackgroundPort.instance) {
      BackgroundPort.instance = new BackgroundPort();
    }

    BackgroundPort.instance.port = port;
    BackgroundPort.instance.createListener();

    return BackgroundPort.instance;
  }

  saveDownloadRecordAction({ id, record, type }, port) {
    record._id = this.getRawId(id, type);

    this.downloadRecordRepo.putRecord(record);
  }

  getDownloadRecordAction({ id, type }, port) {
    this.downloadRecordRepo.retrieveRecord(this.getRawId(id, type)).then(doc => {
      port.postMessage({
        channel: DownloadRecordPort.portName + ':get-download-record',
        data: doc
      });
    }).catch(error => {
      port.postMessage({
        channel: DownloadRecordPort.portName + ":get-download-record",
        error: error.message
      });
    });
  }

  getDownloadRecordsFromIdsAction({ ids, responseArgs }, port) {
    this.downloadRecordRepo.retrieveRecordsFromIds(ids).then(docs => {
      port.postMessage({
        channel: DownloadRecordPort.portName + ':get-download-records',
        data: {
          dataset: docs,
          responseArgs
        }
      });
    }).catch(error => {
      port.postMessage({
        channel: DownloadRecordPort.portName + ':get-download-records',
        error: error.message
      });
    });
  }

  getDownloadAction({ id, type }, port) {
    let responseData = {
      channel: DownloadRecordPort.portName + ":get-download",
    };

    this.downloadRecordRepo.getDownload(this.getRawId(id, type)).then(doc => {
      responseData.data = {
        download: doc
      };
    }).catch(error => {
      responseData.error = error;
    }).finally(() => {
      port.postMessage(responseData);
    });
  }

  deleteDownloadAction({ id }, port) {
    this.downloadRecordRepo.deleteDownload(id).then(() => {
      this.responseSuccess(port, 'delete-download');
    }).catch(error => {
      this.responseError(port, 'delete-download', error.message);
    });
  }

  listDownloadsAction({ selector, sort, limit, skip, query }, port) {
    let options = {
      selector,
      sort,
      limit,
      skip
    };

    if (!!query) {
      options.fun = (doc, emit) => {
        if (/\d+/.test(query) && doc._id.substr(1) === query) {
          emit(doc);
        } else if (doc.title && doc.title.toLowerCase().indexOf(query) > -1) {
          emit(doc);
        }
      };
    }

    this.downloadRecordRepo.listDownloads(options).then(docs => {
      this.responseSuccess(port, 'list-downloads', {
        datasets: docs
      });
    }).catch(error => {
      this.responseError(port, 'list-downloads', error.message);
    });
  }

  clearDownloadsAction() {
    this.downloadRecordRepo.clearDownloads();
  }
}
