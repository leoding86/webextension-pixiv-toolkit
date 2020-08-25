import Browser from '@/modules/Browser/Browser';

export default class DownloadRecordPort {
  static instance;

  static illustType = 'I';

  static novelType = 'N';

  static portName = 'download-record-port';

  /**
   * @constructor
   */
  constructor() {
    this.browser = Browser.getBrowser();
    this.port = null;
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

  getRawId(id, type) {
    if ([DownloadRecordPort.illustType, DownloadRecordPort.novelType].indexOf(type) < 0) {
      throw Error(`Invalid download record type "${type}"`);
    }

    return type + id;
  }

  sendMessageThroughPort(port, channel, data) {
    port.postMessage(Object.assign({
      channel: `${DownloadRecordPort.portName}:${channel}`
    }, data));
  }

  responseSuccess(port, channel, data) {
    this.sendMessageThroughPort(port, channel, data ? { data: data } : {});
  }

  responseError(port, channel, error) {
    this.sendMessageThroughPort(port, channel, {
      error: error
    });
  }

  isChannel(incomingChannel, channel) {
    return incomingChannel === `${DownloadRecordPort.portName}:${channel}`;
  }
}
