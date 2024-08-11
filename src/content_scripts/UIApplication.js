import '@/core/global';
import App from './components/App';
import AppLegacy from './components/AppLegacy.vue';
import browser from '@/modules/Extension/browser';
import I18n from '@/modules/I18n';
import SuperMixin from '@/mixins/SuperMixin';
import Vue from 'vue';

class UIApplication {
  /**
   * @type {Vue}
   */
  app;

  /**
   * Create vue application
   * @constructor
   */
  constructor() {
    /**
     * Configurate Vue
     */
    Vue.prototype.$browser = browser;
    Vue.mixin(SuperMixin);
  }

  createComponent() {
    return new Promise(resolve => {
      /**
       * Load settings
       */
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
        // container.style.display = 'none';

        document.body.appendChild(container);

        window.$eventBus = new Vue();

        window.$extension = this.app = new Vue({
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

          render: h => h(window.$app.settings.downloadMode === 2 ? App : AppLegacy),

          methods: {
            /**
             * Load data
             * @param {{url: string, type: string}} data
             */
            loadData(data) {
              window.$eventBus.$emit('pagechange', { url: data.url, type: data.type });
            },

            /**
             * Unload
             */
            unload() {
              window.$eventBus.$emit('pagechange', null);
            },

            /**
             * Get item
             * @param {string} offset
             * @returns
             */
            getItem(offset) {
              return this.globalBrowserItems[offset];
            },
          }
        });

        resolve();
      });
    });
  }

  /**
   * Create ui application
   * @returns {UIApplication}
   */
  static async createApp() {
    let app = new UIApplication();
    await app.createComponent();
    return app;
  }

  /**
   * Load filtered data
   * @param {{ url: string, type: string}} data
   */
  loadData(data) {
    this.app.loadData(data);
  }

  unload() {
    const $el = this.app.$el;
    this.app.$destroy();
    $el.parentElement.removeChild($el);
  }
}

export default UIApplication;
