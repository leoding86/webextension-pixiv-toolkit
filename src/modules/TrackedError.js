import Db from '@/modules/Db/Db';
import TrackedErrorRepo from '@/module/Db/Repository/TrackedErrorRepo';

/**
 * @class
 */
class TrackedError {
  /**
   * @type {Db}
   */
  db;

  /**
   * @type {TrackedErrorRepo}
   */
  trackedErrorRepo;

  /**
   * @constructor
   */
  constructor({ max } = { max: 500 }) {
    this.db = Db.getDb();
    this.trackedErrorRepo = this.db.trackedErrorRepo();
    this.setMax(max);
  }

  setMax(max) {
    this.trackedErrorRepo.setMax(max);
  }

  async addItem(data) {
    await this.trackedErrorRepo.addItem(data);
  }

  deleteItem(id) {
    this.trackedErrorRepo.deleteItem(id);
  }

  clear() {
    this.trackedErrorRepo.clear();
  }
}

export default TrackedError;
