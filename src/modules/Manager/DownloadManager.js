import DownloadRecord from '@/repositories/DownloadRecord';

class DownloadManager {
  static instance;

  static illustType = 'I';

  static novelType = 'N';

  constructor() {
    /**
     * @var {DownloadRecord}
     */
    this.downloadRecord = DownloadRecord.getDefault();
  }

  static getDefault() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }

    return DownloadManager.instance;
  }

  static getRecord(workId, type) {
    let downloadManager = DownloadManager.getDefault();

    return downloadManager.getRecord(type + workId);
  }

  static saveRecord(workId, type, record) {
    if ([DownloadManager.illustType, DownloadManager.novelType].indexOf(type) < 0) {
      throw Error('Invalid download record type: ' + type);
    }

    let downloadManager = DownloadManager.getDefault();

    return downloadManager.saveRecord(type + workId, record);
  }

  getRecord(workId) {
    return this.downloadRecord.retrieveRecord(workId);
  }

  saveRecord(workId, record) {
    if (typeof record !== 'object') {
      throw Error('Invalid record: ' + record);
    }

    record._id = workId;

    return this.downloadRecord.putRecord(record);
  }
}

export default DownloadManager;
