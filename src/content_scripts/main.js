import Vue from 'vue';
import App from './components/App';
import Browser from '@/modules/Browser/Browser'
import PlusAddonPort from '@/modules/PlusAddonPort'

// create extension mount point
let browser = window.browser = Browser.getBrowser()

let plusAddonPort = window.plusAddonPort = PlusAddonPort.getInstance('content_scripts')

if (browser.runtime.lastError) {
  plusAddonPort = null
}

let container = document.createElement('div');
container.id = '__ptk-app';

// apply styles
container.style.position = 'fixed';
container.style.left = '0';
container.style.bottom = '0';
container.style.width = '100%';
container.style.height = '0';
container.style.overflow = 'visible';
container.style.display = 'none';

// insert container
document.body.appendChild(container);

new Vue({
  el: '#__ptk-app',
  render: h => h(App),
  data() {
    return {
      plusVersion: null
    }
  },
  beforeMount() {
    if (plusAddonPort) {
      if (plusAddonPort) {
        plusAddonPort.port.onMessage.addListener(this.checkPlusAddon)

        plusAddonPort.checkPlusAddonInstalled()
      }
    }
  },

  methods: {
    checkPlusAddon(message, port) {
      if (message && message.version) {
        this.plusVersion = message.version
      }

      plusAddonPort.port.onMessage.removeListener(this.checkPlusAddon)
    }
  }
});
