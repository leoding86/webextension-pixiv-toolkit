import Vue from 'vue'
import App from './App'
import router from './router'
import cr from './modules/cr';

Vue.config.productionTip = false
window.cr = {}

cr._s.get().then(function (items) {
    window.cr = {
        storage: {
            items: items
        }
    }

    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      render: h => h(App)
    })
});
