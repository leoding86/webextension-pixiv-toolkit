import DownloadHistory from "@/modules/DownloadHistory";
import AbstractService from "./AbstractService";

/**
 * @class Download service
 */
 class DownloadHistoryService extends AbstractService {
  /**
   * @type {DownloadHistoryService}
   */
  static instance;

  /**
   * @type {DownloadHistory}
   */
  downloadHistory;

  /**
   * @constructor
   */
  constructor() {
    super();

    this.downloadHistory = new DownloadHistory();
  }

  /**
   *
   * @returns {DownloadHistoryService}
   */
  static getService() {
    if (!DownloadHistoryService.instance) {
      DownloadHistoryService.instance = new DownloadHistoryService();
    }

    return DownloadHistoryService.instance;
  }

  addItem(data) {
    if (this.application.settings.notSaveNSFWWorkInHistory) {
      if (!data.r) {
        this.downloadHistory.addItem(data);
      }
    } else {
      this.downloadHistory.addItem(data);
    }
  }
}

export default DownloadHistoryService;
