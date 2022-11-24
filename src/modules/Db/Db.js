import Dexie from 'dexie';
import DownloadHistoryRepo from './Repository/DownloadHistoryRepo';
import TrackedErrorRepo from './Repository/TrackedErrorRepo';
import VisitHistoryRepo from './Repository/VisitHistoryRepo';

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
      tracked_errors: '++id,error,created_at',
      visit_histories: '++id,&uid,title,userName,cover,url,type,r,downloaded_at',
      download_histories: '++id,&uid,title,userName,cover,url,type,r,visited_at',
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

  trackedErrorRepo() {
    return TrackedErrorRepo.getDefault(this.database.tracked_errors);
  }

  visitHistoryRepo() {
    return VisitHistoryRepo.getDefault(this.database.visit_histories);
  }

  downloadHistoryRepo() {
    return DownloadHistoryRepo.getDefault(this.database.download_histories);
  }
}

export default Db;
