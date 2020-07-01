import Vue from 'vue';
import VueI18n from 'vue-i18n';
import locales from 'locales';

Vue.use(VueI18n);

export default class I18n {
  static i18n(locale) {
    let i18n = new VueI18n({
      locale: (!locale || locale === 'default') ? 'en' : locale,
      messages: {
        en: locales.localeEn,
        'zh_CN': locales.localeZhCN
      }
    });

    return i18n;
  }
}
