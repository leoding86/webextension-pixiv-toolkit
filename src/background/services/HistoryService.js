import History from "@/modules/History";
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
}

export default HistoryService;
