import Browser from './Browser';

class Runtime {

  static instance;

  constructor() {
    this.runtime = Browser.getBrowser().runtime;
  }

  static getInstance() {
    if (Runtime.instance !== undefined) {
      return Runtime.instance
    }

    return Runtime.instance = new Runtime();
  }

  static getRuntime () {
    let instance = Runtime.getInstance();

    return instance.runtime;
  }
}

export default Runtime;
