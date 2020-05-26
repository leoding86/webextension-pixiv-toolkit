import Event from '@/modules/Event';

export default class ThemeDetector extends Event {
  static default;

  static LIGHT_THEME = 'light';

  static DARK_THEME = 'dark';

  constructor() {
    super();
    this.localStorage = window.localStorage;
    this.bindStorageEventListeners();
  }

  /**
   * @returns {ThemeDetector}
   */
  static getDefault() {
    if (!ThemeDetector.default) {
      ThemeDetector.default = new ThemeDetector();
    }

    return ThemeDetector.default;
  }

  bindStorageEventListeners() {
    window.addEventListener('storage', () => {
      this.dispatch('change', [window.localStorage]);
    });
  }

  /**
   * @returns {Boolean}
   */
  isDark() {
    return this.getTheme() === ThemeDetector.DARK_THEME;
  }

  /**
   * @returns {Boolean}
   */
  isLight() {
    return this.getTheme() === ThemeDetector.LIGHT_THEME;
  }

  /**
   * @returns {String}
   */
  getTheme() {
    switch (this.localStorage.theme) {
      case ThemeDetector.DARK_THEME:
        return ThemeDetector.DARK_THEME;
      default:
        return ThemeDetector.LIGHT_THEME;
    }
  }
}
