import Db from '@/modules/Db/Db';
import VisitHistoryRepo from '@/modules/Db/Repository/VisitHistoryRepo';

/**
 * @class
 */
class DownloadHistory {
  /**
   * @type {Db}
   */
  db;

  /**
   * @type {VisitHistoryRepo}
   */
  visitHistoryRepo;

  /**
   * @constructor
   */
  constructor({ max } = { max: 10000 }) {
    this.db = Db.getDb();
    this.visitHistoryRepo = this.db.visitHistoryRepo();
    this.setMax(max);
  }

  setMax(max) {
    this.visitHistoryRepo.setMax(max);
  }

  async addItem(data) {
    await this.visitHistoryRepo.addItem(data);
  }

  deleteItem(id) {
    this.visitHistoryRepo.deleteItem(id);
  }

  clear() {
    this.visitHistoryRepo.clear();
  }
}

export default DownloadHistory;
