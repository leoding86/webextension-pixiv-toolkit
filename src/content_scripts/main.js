import '@/content_scripts/styles/dark.scss';

import '@/core/global';
import App2 from './components/App';
import Browser from '@/modules/Browser/Browser';
import I18n from '@/modules/I18n';
import SuperMixin from '@/mixins/SuperMixin';
import Vue from 'vue';
import ErrorTracker from '@/modules/ErrorTracker';

/**
 * Configurate Vue
 */
Vue.prototype.$browser = window.browser /* For back compatible */ = Browser.getBrowser();
Vue.mixin(SuperMixin);

let errorTracker = new ErrorTracker();
errorTracker.addListener('error', errorMessage => {
  console.log(errorMessage);
  browser.runtime.sendMessage({
    action: 'trackError',
    args: {
      errorMessage
    }
  });
});

browser.storage.local.get(null, items => {
  let i18n = I18n.i18n(items.language, browser.i18n.getUILanguage());

  /**
   * Create app mount point
   */
  let container = document.createElement('div');

  container.id = '__ptk-app';
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.bottom = '0';
  container.style.width = '100%';
  container.style.height = '0';
  container.style.overflow = 'visible';
  container.style.display = 'none';

  document.body.appendChild(container);

  window.$extension = new Vue({
    el: '#__ptk-app',

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

    render: h => h(App2),

    methods: {
      getItem(offset) {
        return this.globalBrowserItems[offset];
      },
    }
  });
});
