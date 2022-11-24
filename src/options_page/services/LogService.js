import AbstractService from "./AbstractService";
import Dexie from "dexie";

/**
 * @class
 */
class LogService extends AbstractService {
  /**
   * @type {LogService}
   */
  static instance;

  /**
   * @type {Dexie}
   */
  db;

  /**
   * @constructor
   */
  constructor() {
    this.db = new Dexie('PixivToolkitDatabase');
    this.db.version(1).stores({
      'track_errors': "++id,error",
    });
  }

  /**
   *
   * @returns {LogService}
   */
  static getService() {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }

    return LogService.instance;
  }

  /**
   *
   * @param {{ error: string }} param0
   */
  async trackError({ error }) {
    let count = await this.db.track_errors.count();

    if (count > 500) {
      await this.db.track_errors.sortBy('id')
                                .limit(count - 500)
                                .delete();
    }

    this.db.track_errors.add({ error });
  }

  getTrackedErrors() {

  }
}

export default LogService;
