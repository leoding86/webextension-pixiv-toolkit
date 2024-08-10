import 'vuetify/dist/vuetify.min.css';

import '@/core/global';
import Application from "./DownloadsApplication";
import Bootstrap from "./DownloadsBootstrap";
import browser from "@/modules/Extension/browser";
import I18n from '@/modules/I18n';
import Downloads from './Downloads.vue';
import moment from 'moment';
import router from './router';
import SuperMixin from '@/mixins/SuperMixin';
import Vue from 'vue'
import Vuetify from 'vuetify';

/**
 * Make sure there is only one downloads page open. When the page first opened
 * get the previous opened tab id, if there isn't a previous downloads page
 * opened, then load the application and ui. If a previous downloads page tab id
 * is exists, then check if the page is still opening. Exit the process if the
 * page is still open otherwise save the current tab id to storage and contiune
 * the process.
 */
(async () => {
  window.__CURRENT_ACTIVE_DM__ = false;

  let openedTabId = 0;
  let openedWindowId = 0;

  /**
   * The codes below MUST be in async function or it will halt up the process
   * if there isn't any download manager opened.
   */
  (async () => {
    let response = await browser.runtime.sendMessage({
      action: 'download:checkIfDownloadManagerOpened',
    });

    if (response.result) {
      openedTabId = response.data.tabId;
      openedWindowId = response.data.windowId;
    }
  })();

  setTimeout(() => {
    /**
     * If there is response returned that means the download manger is
     * already opened, otherwise update the download manager tabId and open
     * the download manager.
     */
    if (openedTabId <= 0) {
      window.__CURRENT_ACTIVE_DM__ = true;
    }

    bootApplication();
  }, 600);

  async function bootApplication() {
    /**
     * Boot the application.
     */
    Bootstrap.__main__();

    window.application = window.$app = Application.app();

    /**
     * Boot the UI
     */
    Vue.config.productionTip = false;
    Vue.mixin(SuperMixin);

    moment.locale('zh_CN', {
      months: [
        '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
      ],
      weekdays: [
        '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'
      ],
      meridiem : function (hour, minute, isLowercase) {
        if (hour < 9) {
            return "早上";
        } else if (hour < 11 && minute < 30) {
            return "上午";
        } else if (hour < 13 && minute < 30) {
            return "中午";
        } else if (hour < 18) {
            return "下午";
        } else {
            return "晚上";
        }
      }
    });

    window.browser = browser;

    /**
     * Update browser action badge
     */
    const textNew = await browser.action.getBadgeText({});

    if (textNew.toLowerCase() === 'new') {
      browser.action.setBadgeText({ text: '' });
    }

    let items = await browser.storage.local.get(null);

    const i18n = I18n.i18n(items.language, browser.i18n.getUILanguage());

    moment.locale(i18n.locale);

    Vue.use(Vuetify)

    /* eslint-disable no-new */
    new Vue({
      el: '#app',

      router,

      i18n,

      render: h => h(Downloads),

      data() {
        return {
          appSettings: items,
          isFirefox_: $_browser === 'firefox',
          openedTabId,
          openedWindowId,
        }
      },

      beforeMount() {
        let vm = this;

        browser.storage.onChanged.addListener((items, scope) => {
          for (let key in items) {
            vm.appSettings[key] = items[key].newValue;

            if (key === 'language') {
              if (items[key].newValue === 'default') {
                i18n.locale = chrome.i18n.getUILanguage().replace('-', '_');
              } else {
                i18n.locale = items[key].newValue;
              }

              moment.locale(i18n.locale);
            } else if (key === 'disableDownloadsShelf') {
              browser.downloads.setShelfEnabled(!items[key].newValue);
            }
          }
        });
      }
    });
  }
})();
