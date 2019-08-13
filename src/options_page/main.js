import Vue from 'vue'
import App from './App'
import router from './router'
import cr from './modules/cr'
import { Storage as BrowserStorage } from '@/modules/Browser'
import Browser from '@/modules/Browser/Browser'

window.browser = Browser.getBrowser()

let browserStorage = BrowserStorage.getInstance()

let thisApp = window.thisApp = {}

window.browserItems = {}

Vue.config.productionTip = false
window.cr = {}

cr._s.get().then(function (items) {
    window.cr = {
        storage: {
            items: items
        }
    }

    browserStorage.onChanged().addListener((changes, namespace) => {
      for (let key in changes) {
        window.browserItems[key] = changes[key].newValue;
      }
    })

    browserStorage.get(null).then(items => {
      window.browserItems = thisApp.browserItems = items

      /* eslint-disable no-new */
      new Vue({
        el: '#app',

        router,

        render: h => h(App),

        data() {
          return {
            plusVersion: null
          }
        }
      })
    })
});
