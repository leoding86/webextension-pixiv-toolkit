import Browser from '@/modules/Browser/Browser';
import IllustHistoryRepo from '@/repositories/IllustHistory';

class IllustHistoryPort {
  static instance;

  static port = 'illust_history_port';

  static getInstance() {
    if (IllustHistoryPort.instance) {
      return IllustHistoryPort.instance
    }

    return IllustHistoryPort.instance = new IllustHistoryPort(IllustHistoryPort.port)
  }

  static getInstanceFromPort(port) {
    if (IllustHistoryPort.instance) {
      IllustHistoryPort.instance.createPort(port);
      IllustHistoryPort.instance.createListener();

      return IllustHistoryPort.instance;
    }

    return IllustHistoryPort.instance = new IllustHistoryPort(port);
  }

  /**
   * @constructor
   * @param {string|object}
   */
  constructor(port) {
    this.browser = Browser.getBrowser();
    this.illustHistoryRepo = new IllustHistoryRepo();
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
    this.port.onMessage.addListener(message => {
      if (message.action && typeof this[message.action + 'Action'] === 'function') {
        let result = this[message.action + 'Action'].call(this, message.args);

        if (result instanceof Promise) {
          //
        } else {
          //
        }
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

  saveIllustHistory(args) {
    this.postMessage({
      action: 'saveIllustHistory',
      args: args
    })
  }

  saveIllustHistoryAction(args) {
    return this.illustHistoryRepo.putIllust(args)
  }

  listIllustHistories(args) {
    return this.postMessage({
      action: 'listIllustHistories',
      args: args
    })
  }

  listIllustHistoriesAction() {
    return this.illustHistoryRepo.getIllusts();
  }

  deleteIllustHistory(args) {
    return this.postMessage({
      action: 'deleteIllustHistory',
      args: args
    })
  }

  deleteIllustHistoryAction(args) {
    return this.illustHistoryRepo.deleteIllust(args);
  }
}

export default IllustHistoryPort;
