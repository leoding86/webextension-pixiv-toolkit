import Dexie from 'dexie';
import AbstractRepo from './AbstractRepo';

/**
 * @typedef ItemType
 * @property {string} uid
 * @property {string} title
 * @property {string} cover
 * @property {string} url
 * @property {string} type
 * @property {string} r
 * @property {number} downloaded_at
 */
class DownloadHistoryRepo extends AbstractRepo {
  /**
   * @type {DownloadHistoryRepo}
   */
  static instance;

  /**
   *
   * @param {Dexie.Table} table
   * @param {{ max: number }} param1
   */
  constructor(table, { max } = { max: 10000 }) {
    super();
    this.table = table;
    this.max = max;
  }

  /**
   *
   * @param {Dexie.Table} table
   * @returns {DownloadHistoryRepo}
   */
  static getDefault(table) {
    if (!DownloadHistoryRepo.instance) {
      DownloadHistoryRepo.instance = new DownloadHistoryRepo(table);
    }

    return DownloadHistoryRepo.instance;
  }

  /**
   * @inheritdoc
   */
  async addItem({ uid, title, cover, url, type, r, downloaded_at }) {
    await super.addItem({ uid, title, cover, url, type, r, downloaded_at });
  }
}

export default DownloadHistoryRepo;
