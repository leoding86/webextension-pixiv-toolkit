import Db from '@/modules/Db/Db';
import DownloadHistoryRepo from '@/modules/Db/Repository/DownloadHistoryRepo';

/**
 * @class
 */
class DownloadHistory {
  /**
   * @type {Db}
   */
  db;

  /**
   * @type {DownloadHistoryRepo}
   */
  downloadHistoryRepo;

  /**
   * @constructor
   */
  constructor({ max } = { max: 10000 }) {
    this.db = Db.getDb();
    this.downloadHistoryRepo = this.db.downloadHistoryRepo();
    this.setMax(max);
  }

  setMax(max) {
    this.downloadHistoryRepo.setMax(max);
  }

  async addItem(data) {
    await this.downloadHistoryRepo.addItem(data);
  }

  deleteItem(id) {
    this.downloadHistoryRepo.deleteItem(id);
  }

  clear() {
    this.downloadHistoryRepo.clear();
  }
}

export default DownloadHistory;
