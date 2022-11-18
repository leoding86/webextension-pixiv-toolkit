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
    return this.localStorage.theme === ThemeDetector.DARK_THEME;
  }

  /**
   * @returns {Boolean}
   */
  isLight() {
    return this.localStorage.theme === ThemeDetector.LIGHT_THEME;
  }

  /**
   * @returns {String}
   */
  getTheme() {
    return this.localStorage.theme;
  }
}
