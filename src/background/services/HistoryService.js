import History from "@/modules/History";
import Db from "@/modules/Db/Db";
import AbstractService from "./AbstractService";

/**
 * @class History service
 */
 class HistoryService extends AbstractService {
  /**
   * @type {HistoryService}
   */
  static instance;

  /**
   * @type {History}
   */
  history;

  /**
   * @constructor
   */
  constructor() {
    super();

    this.history = new History();
  }

  /**
   *
   * @returns {HistoryService}
   */
  static getService() {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }

    return HistoryService.instance;
  }

  saveItem(data) {
    if (this.application.settings.notSaveNSFWWorkInHistory) {
      if (!data.r) {
        this.history.saveItem(data);
      }
    } else {
      this.history.saveItem(data);
    }
  }

  itemVisit(data) {
    if (data.visited_at) {
      this.saveItem(data);
    }
  }

  itemDownload(data) {
    if (data.downloaded_at) {
      this.saveItem(data);
    }
  }

  deleteItem(data) {
    if (data.uid) {
      this.history.deleteItem(data.uid);
    }
  }

  async checkIfDownloaded({ uid }) {
    let historyRepo = Db.getDb().historyRepo();
    let item = await historyRepo.getItem({ uid });

    if (item && item.downloaded_at) {
      return item.downloaded_at;
    } else {
      return 0;
    }
  }
}

export default HistoryService;
