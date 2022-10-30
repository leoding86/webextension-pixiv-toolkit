import AbstractPortService from "./AbstractPortService";
import browser from "@/modules/Extension/browser";
import DownloadHistory from "@/background/modules/DownloadHistory";

/**
 * @class
 */
class DownloadHistoryService extends AbstractPortService {
  /**
   * @type {DownloadHistoryService}
   */
  static instance;

  /**
   * @type {Array}
   */
  static ports;

  /**
   * @type {DownloadHistory}
   */
  downloadHistory;

  /**
   * @consturctor
   */
  constructor() {
    super();
    this.downloadHistory = DownloadHistory.getDefault();
  }

  /**
   * Get `DownloadHistoryService` instance
   * @returns {DownloadHisotryService}
   */
  static getService() {
    if (!DownloadHistoryService.instance) {
      DownloadHistoryService.instance = new DownloadHistoryService();
    }

    return DownloadHistoryService.instance;
  }

  saveRecord({ record }) {
    this.downloadHistory.putRecord(record);
  }

  async getRecord({ id, port }) {
    let doc = await this.downloadHistory.getRecord(id);
    port.postMessage({
      service: 'downloadHistory',
      method: 'getRecord',
      message: { doc }
    });
  }

  async getRecordsFromIds({ ids, responseArgs, port }) {
    let docs = await this.downloadHistory.getRecordsFromIds(ids);
    port.postMessage({
      service: 'downloadHistory',
      method: 'getRecordsFormIds',
      message: { docs }
    })
  }

  deleteRecord({ id }) {
    this.downloadHistory.deleteRecord(id);
  }

  async listRecords({ selector, sort, limit, skip, query, port }) {
    let options = { selector, sort, limit, skip };

    if (!!query) {
      options.fun = (doc, emit) => {
        if (/\d+/.test(query) && doc._id.substr(1) === query) {
          emit(doc);
        } else if (doc.title && doc.title.toLowerCase().indexOf(query) > -1) {
          emit(doc);
        }
      }
    }

    let docs = await this.downloadHistory.listRecords(options);
    port.postMessage({
      service: 'downloadHistory',
      method: 'listRecords',
      message: { docs },
    });
  }

  clearRecords() {
    this.downloadHistory.clearRecords();
  }
}

export default DownloadHistoryService;
