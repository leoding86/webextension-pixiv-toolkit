import Dexie from 'dexie';
import HistoryRepo from './Repository/HistoryRepo';
import TrackedErrorRepo from './Repository/TrackedErrorRepo';

class Db {
  /**
   * @type Db
   */
  static instance;

  /**
   * @type {Dexie}
   */
  database;

  constructor() {
    this.database = new Dexie('PixivToolkitDatabase');
    this.database.version(1).stores({
      histories: '++id,&uid,title,userName,cover,url,type,r,downloaded_at,visited_at',
      tracked_errors: '++id,error,created_at',
    });
  }

  /**
   *
   * @returns {Db}
   */
  static getDb() {
    if (!Db.instance) {
      Db.instance = new Db();
    }

    return Db.instance;
  }

  historyRepo() {
    return HistoryRepo.getDefault(this.database.histories);
  }

  trackedErrorRepo() {
    return TrackedErrorRepo.getDefault(this.database.tracked_errors);
  }
}

export default Db;
