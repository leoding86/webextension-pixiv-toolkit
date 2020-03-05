import DownloadRecordRepo from '@/repositories/DownloadRecord';
import DownloadRecordPort from './DownloadRecordPort';

export default class BackgroundPort extends DownloadRecordPort {
  static instance;

  constructor() {
    super();

    this.downloadRecordRepo = new DownloadRecordRepo();
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
}
