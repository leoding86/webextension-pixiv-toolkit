import Vue from 'vue';
import App from './components/App';
import Browser from '@/modules/Browser/Browser'
import PlusAddonPort from '@/modules/PlusAddonPort'

let plusAddonPort = window.plusAddonPort = PlusAddonPort.getInstance('content_scripts')

// create extension mount point
let browser = window.browser = Browser.getBrowser()

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
  render: h => h(App)
});
