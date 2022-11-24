import Dexie from 'dexie';
import AbstractRepo from './AbstractRepo';

/**
 * @class
 */
class VisitHistoryRepo extends AbstractRepo {
  /**
   * @type {VisitHistoryRepo}
   */
  static instance;

  /**
   *
   * @param {Dexie.Table} table
   */
  constructor(table, { max } = { max: 10000 }) {
    super();
    this.table = table;
    this.max = max;
  }

  /**
   *
   * @param {Dexie.Table} table
   * @returns {VisitHistoryRepo}
   */
  static getDefault(table) {
    if (!VisitHistoryRepo.instance) {
      VisitHistoryRepo.instance = new VisitHistoryRepo(table);
    }

    return VisitHistoryRepo.instance;
  }

  /**
   * @inheritdoc
   */
  async addItem({ uid, title, cover, url, type, r, visited_at }) {
    await super.addItem({ uid, title, cover, url, type, r, visited_at });
  }
}

export default VisitHistoryRepo;
