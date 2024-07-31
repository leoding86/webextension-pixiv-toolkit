import AbstractRepo from "./AbstractRepo";
import Dexie from 'dexie';

class TrackedErrorRepo extends AbstractRepo {
  /**
   * @type {TrackedErrorRepo}
   */
  static instance;

  /**
   *
   * @param {Dexie.Table} table
   */
  constructor(table, { max } = { max: 500 }) {
    super();
    this.table = table;
    this.max = max;
  }

  /**
   *
   * @param {Dexie.Table} table
   * @returns {TrackedErrorRepo}
   */
  static getDefault(table) {
    if (!TrackedErrorRepo.instance) {
      TrackedErrorRepo.instance = new TrackedErrorRepo(table);
    }

    return TrackedErrorRepo.instance;
  }

  /**
   * @inheritdoc
   */
  async addItem({ error, created_at }) {
    await super.addItem({ error, created_at });
  }
}

export default TrackedErrorRepo;
