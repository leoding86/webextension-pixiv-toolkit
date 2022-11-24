import VisitHistory from "@/modules/VisitHistory";
import AbstractService from "./AbstractService";

/**
 * @class Download service
 */
 class VisitHistoryService extends AbstractService {
  /**
   * @type {VisitHistoryService}
   */
  static instance;

  /**
   * @type {VisitHistory}
   */
  visitHistory;

  /**
   * @constructor
   */
  constructor() {
    super();

    this.visitHistory = new VisitHistory();
  }

  /**
   *
   * @returns {VisitHistoryService}
   */
  static getService() {
    if (!VisitHistoryService.instance) {
      VisitHistoryService.instance = new VisitHistoryService();
    }

    return VisitHistoryService.instance;
  }

  addItem(data) {
    if (this.application.settings.notSaveNSFWWorkInHistory) {
      if (!data.r) {
        this.visitHistory.addItem(data);
      }
    } else {
      this.visitHistory.addItem(data);
    }
  }
}

export default VisitHistoryService;
