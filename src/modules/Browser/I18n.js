import Browser from './Browser';

class I18n {

  static instance;

  constructor() {
    this.i18n = Browser.getBrowser().i18n;
  }

  static getInstance() {
    if (I18n.instance) {
      return I18n.instance;
    }

    return I18n.instance = new I18n;
  }

  static getI18n() {
    return I18n.getInstance().i18n;
  }
}

export default I18n;
