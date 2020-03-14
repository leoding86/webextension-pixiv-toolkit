import Request from '@/modules/Net/Request';

class Download extends Request {
  /**
   * @constructor
   * @param {string} url
   * @param {object} options
   */
  constructor(url, options = {}) {
    super(url, options);
  }

  /**
   * @override
   * @param {('onfinish')} eventName
   */
  addListener(eventName, listener, thisArg) {
    super.addListener(eventName, listener, thisArg);
  }

  /**
   * @param {any} data
   */
  download(data = null) {
    let self = this;

    this.addListener('onload', data => {
      self.dispatch('onfinish', [new Blob([data.buffer], { type: self.getResponseHeader('Content-Type') })]);
    });

    this.send(data)
  }
}

export default Download;
