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
}
