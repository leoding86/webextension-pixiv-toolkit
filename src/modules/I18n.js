import VueI18n from 'vue-i18n';
import localeEn from '@/statics/_locales/en/messages.json';
import localeZhCN from '@/statics/_locales/zh_CN/messages.json';

export default class I18n {
  static i18n() {
    return new VueI18n({
      locale: 'en',
      messages: {
        en: localeEn,
        'zh_CN': localeZhCN
      }
    });
  }
}
