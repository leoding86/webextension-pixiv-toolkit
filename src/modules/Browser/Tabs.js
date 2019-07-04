import Browser from './Browser';

class Tabs {

  static instance;

  constructor() {
    this.tabs = Browser.getBrowser().tabs;
  }

  static getInstance() {
    if (Tabs.instance !== undefined) {
      return Tabs.instance;
    }

    return Tabs.instance = new Tabs();
  }

  static getTabs () {
    let instance = Tabs.getInstance();

    return instance.tabs;
  }
}

export default Tabs;
