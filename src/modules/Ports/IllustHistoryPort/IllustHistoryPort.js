import Browser from '@/modules/Browser/Browser';

export default class IllustHistoryPort {
  /**
   * @var {string}
   */
  static portName = 'illust-history-port';

  constructor() {
    this.browser = Browser.getBrowser();
    this.port = null;
  }

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
    this.port.onMessage.addListener(message => {
      if (message.action && typeof this[message.action + 'Action'] === 'function') {
        let result = this[message.action + 'Action'].call(this, message.args);
      }
    });

    this.port.onDisconnect.addListener(() => {
      console.log('Disconnect');
    });
  }
}
