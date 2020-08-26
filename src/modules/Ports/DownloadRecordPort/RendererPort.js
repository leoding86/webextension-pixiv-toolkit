import DownloadRecordPort from './DownloadRecordPort';

export default class RendererPort extends DownloadRecordPort {
  static instance;

  constructor() {
    super();

    this.createPort(DownloadRecordPort.portName);
  }

  /**
   * @returns {RendererPort}
   */
  static getInstance() {
    if (RendererPort.instance) {
      return RendererPort.instance
    }

    return RendererPort.instance = new RendererPort()
  }

  postMessage(args) {
    try {
      this.port.postMessage(args)
    } catch (e) {
      // console.log(e)
    }
  }

  saveDownloadRecord({ id, record, type }) {
    this.postMessage({
      action: 'saveDownloadRecord',
      args: { id, record, type }
    })
  }

  getDownloadRecord({ id, type }) {
    this.postMessage({
      action: 'getDownloadRecord',
      args: { id, type }
    })
  }

  getDownloadRecordsFromIds({ ids, responseArgs }) {
    this.postMessage({
      action: 'getDownloadRecordsFromIds',
      args: { ids, responseArgs }
    })
  }

  getDownload({ id, type }) {
    this.postMessage({
      action: 'getDownload',
      args: { id, type }
    });
  }

  deleteDownload({ id }) {
    this.postMessage({
      action: 'deleteDownload',
      args: { id }
    })
  }

  listDownloads(options) {
    options = Object.assign({
      selector: { downloaded_at: { $gte: null } },
      sort: [{ downloaded_at: 'desc' }],
      limit: 50,
      skip: 0,
      query: null
    }, options);

    this.postMessage({
      action: 'listDownloads',
      args: options
    });
  }

  /**
   * Clear all downloads
   */
  clearDownloads() {
    this.postMessage({
      action: 'clearDownloads',
    });
  }
}
