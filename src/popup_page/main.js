import App from './App';
import Browser from '@/modules/Browser/Browser';
import I18n from '@/modules/I18n';
import Vue from 'vue';

Vue.config.productionTip = false;

window.browser = Browser.getBrowser();

const i18n = I18n.i18n();

browser.storage.local.get(null, items => {
  i18n.locale = items.language || 'default';

  new Vue({
    el: '#app',

    i18n,

    render: h => h(App),

    data() {
      return {
        browserItems: items
      }
    },

    beforeMount() {
      let vm = this;

      browser.storage.onChanged.addListener((items) => {
        for (let key in items) {
          vm.browserItems[key] = items[key].newValue;
        }
      });
    }
  });
});
