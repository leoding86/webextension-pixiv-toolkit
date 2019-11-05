import Vue from 'vue';
import App from './App';
import browser from '@/modules/Extension/browser';

Vue.config.productionTip = false;

browser.storage.local.get(null, items => {
  new Vue({
    el: '#app',

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
