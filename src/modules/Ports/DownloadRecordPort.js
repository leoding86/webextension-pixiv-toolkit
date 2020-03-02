import Browser from '@/modules/Browser/Browser';
import DownloadRecordRepo from '@/repositories/DownloadRecord';

export default class DownloadRecordPort {
  static instance;

  static illustType = 'I';

  static novelType = 'N';

  static port = 'download_record_port';

  /**
   * @returns {DownloadRecordPort}
   */
  static getInstance() {
    if (DownloadRecordPort.instance) {
      return DownloadRecordPort.instance
    }

    return DownloadRecordPort.instance = new DownloadRecordPort(DownloadRecordPort.port)
  }

  /**
   * @param {String} port
   * @returns {DownloadRecordPort}
   */
  static getInstanceFromPort(port) {
    if (DownloadRecordPort.instance) {
      DownloadRecordPort.instance.createPort(port);
      DownloadRecordPort.instance.createListener();

      return DownloadRecordPort.instance;
    }

    return DownloadRecordPort.instance = new DownloadRecordPort(port);
  }

  /**
   * @constructor
   * @param {string|object}
   */
  constructor(port) {
    this.browser = Browser.getBrowser();
    this.downloadRecordRepo = new DownloadRecordRepo();
    this.port;

    this.createPort(port);
    this.createListener();
  }

  /**
   * Create a port to background for communicating
   *
   * @param {string|object} port
   * @returns {this}
   */
  createPort(port) {
    if (typeof port === 'string') {
      this.port = this.browser.runtime.connect({
        name: port
      });
    } else {
      this.port = port;
    }

    return this;
  }

  createListener() {
    this.port.onMessage.addListener((message, port) => {
      if (message.action && typeof this[message.action + 'Action'] === 'function') {
        let result = this[message.action + 'Action'].call(this, message.args, port);
      }
    });

    this.port.onDisconnect.addListener(() => {
      console.log('Disconnect');
    });
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

  getRawId(id, type) {
    if ([DownloadRecordPort.illustType, DownloadRecordPort.novelType].indexOf(type) < 0) {
      throw Error(`Invalid download record type "${type}"`);
    }

    return type + id;
  }

  saveDownloadRecordAction({ id, record, type }, port) {
    record._id = this.getRawId(id, type);

    this.downloadRecordRepo.putRecord(record);
  }

  getDownloadRecordAction({ id, type }, port) {
    this.downloadRecordRepo.retrieveRecord(this.getRawId(id, type)).then(doc => {
      port.postMessage({
        channel: DownloadRecordPort.port + ':get-download-record',
        data: doc
      });
    }).catch(error => {
      port.postMessage({
        channel: DownloadRecordPort.port + ":get-download-record",
        error: error.message
      });
    });
  }
}
