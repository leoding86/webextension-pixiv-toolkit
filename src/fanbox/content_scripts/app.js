import '@/core/global';
import App from '@/fanbox/content_scripts/App.vue';
import Browser from '@/modules/Browser/Browser';
import I18n from '@/modules/I18n';
import SuperMixin from '@/mixins/SuperMixin';
import Vue from 'vue';

/**
 * Configurate Vue
 */
Vue.prototype.$browser = window.browser /* For back compatible */ = Browser.getBrowser();
Vue.mixin(SuperMixin);

const settings = [
  'language',
  'illustrationRelativeLocation', 'illustrationRenameFormat', 'illustrationImageRenameFormat',
  'illustrationPageNumberStartWithOne', 'illustrationKeepPageNumber',
  'downloadPanelStyle', 'downloadPanelPosition',
  'guideShowed', 'autoActivateDownloadPanel'
];

browser.storage.local.get(settings, items => {
  let i18n = I18n.i18n(items.language, browser.i18n.getUILanguage());

  /**
   * Create app mount point
   */
  let container = document.createElement('div');

  container.id = '__ptk-fanbox-app';
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.bottom = '0';
  container.style.width = '100%';
  container.style.height = '0';
  container.style.overflow = 'visible';
  container.style.display = 'none';

  document.body.appendChild(container);

  window.$extension = new Vue({
    el: '#' + container.id,

    i18n,

    data() {
      return {
        globalBrowserItems: items,
        isFirefox_: navigator.userAgent.toLowerCase().indexOf('firefox') > -1
      }
    },

    beforeMount() {
      let vm = this;

      this.$browser.storage.onChanged.addListener(changes => {
        for (let key in changes) {
          vm.globalBrowserItems[key] = changes[key].newValue;

          if (key === 'language') {
            if (changes[key].newValue === 'default') {
              i18n.locale = chrome.i18n.getUILanguage().replace('-', '_');
            } else {
              i18n.locale = changes[key].newValue;
            }
          }
        }
      });
    },

    render: h => h(App),

    methods: {
      getItem(offset) {
        return this.globalBrowserItems[offset];
      },
    }
  });
});
