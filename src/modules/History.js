import Db from '@/modules/Db/Db';
import HistoryRepo from '@/modules/Db/Repository/HistoryRepo';

/**
 * @class
 */
class History {
  /**
   * @type {Db}
   */
  db;

  /**
   * @type {HistoryRepo}
   */
  historyRepo;

  /**
   * @constructor
   */
  constructor({ max } = { max: 10000 }) {
    this.db = Db.getDb();
    this.historyRepo = this.db.historyRepo();
    this.setMax(max);
  }

  setMax(max) {
    this.historyRepo.setMax(max);
  }

  async saveItem(data) {
    await this.historyRepo.saveItem(data);
  }

  deleteItem(id) {
    this.historyRepo.deleteItem(id);
  }

  clear() {
    this.historyRepo.clear();
  }
}

export default History;
