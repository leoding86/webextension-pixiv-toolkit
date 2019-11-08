import Vue from 'vue';
import App from './components/App';
import Browser from '@/modules/Browser/Browser';
import SuperMixin from '@/mixins/SuperMixin';

/**
 * Configurate Vue
 */
Vue.prototype.$browser = window.browser /* For back compatible */ = Browser.getBrowser();
Vue.mixin(SuperMixin);

browser.storage.local.get(null, items => {
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

    data() {
      return {
        globalBrowserItems: items
      }
    },

    beforeMount() {
      let vm = this;

      this.$browser.storage.onChanged.addListener(changes => {
        for (let key in changes) {
          vm.globalBrowserItems[key] = changes[key].newValue;
        }
      });
    },

    render: h => h(App)
  });
});
