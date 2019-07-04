import Vue from 'vue'
import App from './App'
import router from './router'
import cr from './modules/cr'
import { Storage as BrowserStorage } from '@/modules/Browser'
import Browser from '@/modules/Browser/Browser'
import PlusAddonPort from '@/modules/PlusAddonPort'

let browser = window.browser = Browser.getBrowser()

let browserStorage = BrowserStorage.getInstance()

let thisApp = window.thisApp = {}

let plusAddonPort

plusAddonPort = window.plusAddonPort = new PlusAddonPort('options_page')

if (browser.runtime.lastError) {
  plusAddonPort = null
}

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
        },
        beforeMount() {
          let vm = this

          if (plusAddonPort) {
            plusAddonPort.port.onMessage.addListener((message, port) => {
              if (message && message.version) {
                vm.plusVersion = message.version
              }
            })

            plusAddonPort.checkPlusAddonInstalled()
          }
        },
      })
    })
});
