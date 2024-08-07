<template>
  <control-panel v-if="showApp" :lastError="lastError"
    :panelStyle="browserItems.downloadPanelStyle"
    :panelPosition="browserItems.downloadPanelPosition"
  >
    <template v-if="!isUgoira">
      <ptk-button @click="download"
        :type="downloadButtonType"
      >{{ tl('_download') }}</ptk-button>
    </template>
    <template v-else>
      <ptk-button @click="download({ ugoiraConvertType: 'apng' })"
        :type="downloadButtonType"
      >{{ tl('_download_apng') }}</ptk-button>
      <ptk-button @click="download({ ugoiraConvertType: 'gif' })"
        :type="downloadButtonType"
      >{{ tl('_download_gif') }}</ptk-button>
      <ptk-button @click="download({ ugoiraConvertType: 'webm' })"
        :type="downloadButtonType"
      >{{ tl('_download_webm') }}</ptk-button>
      <ptk-button @click="download({ ugoiraConvertType: 'mp4' })"
        :type="downloadButtonType"
      >{{ tl('_download_mp4') }}</ptk-button>
      <ptk-button @click="download"
        :type="downloadButtonType"
      >{{ tl('_download_custom') }}</ptk-button>
    </template>
    <page-selector
      ref="pageSelector"
      v-if="pages && pages.length > 1"
      :items="pages"
      @select="pageSelectorSelectHandler"
      @download="pageSelectorDownloadHandler"
    ></page-selector>
    <div class="ptk__download-added-notice" v-show="showNotice">
      {{ tl(this.noticeMessage) }}
    </div>
    <!-- <ptk-button v-if="!isUndetermined && browserItems.showPixivOmina"
      class="ptk__pixiv-omina__btn"
      @click="passToPixivOmina"
    >Pixiv Omina</ptk-button> -->
  </control-panel>
</template>

<script>
import '@/content_scripts/styles/dark.scss';
import Adapter from '@/content_scripts/modules/Adapter';
import Button from '@/content_scripts/components/Button.vue';
import ControlPanel from '@/content_scripts/components/ControlPanel.vue';
import PageSelector from '@/content_scripts/components/PageSelector.vue';
import browser from '@/modules/Extension/browser';
import AbstractResource from "@/modules/PageResource/AbstractResource";
import { RuntimeError } from '@/errors';
import moment from 'moment';

export default {
  components: {
    'control-panel': ControlPanel,
    'ptk-button': Button,
    'page-selector': PageSelector,
  },

  data() {
    return {
      /**
       * @type {string}
       */
      lastError: '',

      /**
       * @type {boolean}
       */
      isDark: false,

      /**
       * @type {string[]}
       */
      pages: [],

      /**
       * @type {AbstractResource}
       */
      resource: null,

      /**
       * @type {number[]}
       */
      selectedIndexes: [],

      /**
       * @type {boolean}
       */
      downloadedAt: 0,

      showNotice: false,

      noticeMessage: ''
    };
  },

  computed: {
    /**
     * @returns {boolean}
     */
    showApp() {
      return !!this.resource;
    },

    downloadButtonType() {
      return this.downloadedAt > 0 ? 'success' : '';
    },

    isUgoira() {
      return this.resource &&
        this.resource.context &&
        this.resource.context.type === 'Illust' &&
        this.resource.context.illustType === 2
    }
  },

  created() {
    /**
     * @type {Adapter}
     */
    this.adapter = new Adapter();

    /**
     * @type {ReturnType<typeof setTimeout>}
     */
    this.noticeCloseTimeout;

    window.$eventBus.$on('pagechange', page => {
      this.abortAdapterParse();

      if (page) {
        this.resource = window.$app.resource;

        /**
         * Save visit history
         */
        browser.runtime.sendMessage({
          to: 'ws',
          action: 'history:itemVisit',
          args: {
            uid: this.resource.getUid(),
            title: this.resource.getTitle(),
            userName: this.resource.getUserName(),
            cover: this.resource.getCover(),
            url: this.resource.getUrl(),
            type: this.resource.getType(),
            r: this.resource.getR(),
            visited_at: moment().unix(),
          }
        });

        if (this.resource.getPages()) {
          if (this.resource.getPageResolver()) {
            this.resource.getPages().forEach(page => {
              this.pages.push('');
            });

            const pageResolver = this.resource.getPageResolver();
            const resolvePages = async (index = 0, pages) => {
              const page = pages[index];

              if (!page) {
                return;
              }

              const url = await pageResolver(page);

              if (this.$refs.pageSelector) {
                this.$refs.pageSelector.updatePage(index, url);
              }

              resolvePages(index + 1, pages);
            };

            resolvePages(0, this.resource.getPages());
          } else {
            this.pages = this.resource.getPages();
          }
        }

        this.checkIfDownloaded();
      }
    });
  },

  methods: {
    displayNotice(message) {
      if (this.noticeCloseTimeout) {
        clearTimeout(this.noticeCloseTimeout);
      }

      this.noticeMessage = message;
      this.showNotice = true;

      this.noticeCloseTimeout = setTimeout(() => this.showNotice = false, 3000);
    },

    abortAdapterParse() {
      this.adapter.abort();
      this.resource = null;
      this.downloadedAt = 0;
      this.pages = this.selectedIndexes = [];
    },

    /**
     * @param {Function} [fnAfterOpen]
     */
    async checkDownloadManager(fnAfterOpen) {
      let timeout = setTimeout(() => {
        this.displayNotice('_opening_download_manager');

        browser.runtime.sendMessage({
          to: 'ws',
          action: 'tab:openTab',
          args: {
            url: browser.runtime.getURL('/options_page/downloads.html#/')
          }
        }, () => {
          if (fnAfterOpen) {
            setTimeout(() => fnAfterOpen(), 1500);
          }
        });
      }, 600);

      let response = await browser.runtime.sendMessage({
        action: 'download:checkIfDownloadManagerOpened'
      });

      if (response) {
        fnAfterOpen();
        clearTimeout(timeout);
      }
    },

    async checkIfDownloaded() {
      let downloadedAt = await browser.runtime.sendMessage({
        action: 'download:checkIfDownloaded',
        args: {
          uid: this.resource.getUid()
        }
      });

      if (downloadedAt) {
        this.downloadedAt = downloadedAt;
      }
    },

    async download({ ugoiraConvertType } = {}) {
      await this.checkDownloadManager(async () => {
        const args = {
          unpackedResource: this.resource.unpack()
        };

        if (this.isUgoira) {
          args.options = { ugoiraConvertType };
        } else {
          args.options = { selectedIndexes: this.selectedIndexes };
        }

        let response = await browser.runtime.sendMessage({
          action: 'download:addDownload',
          args
        });

        if (!response.result) {
          if (response.errorName === 'DownloadTaskExistsError') {
            alert(this.tl(`_the_resource_is_already_in_download_manager`));
          } else {
            alert(this.tl('_unkown_error') + ': ' + response.errorName);
          }
          return;
        } else {
          this.displayNotice('_download_added');
        }

        /**
         * Save download history
         */
        browser.runtime.sendMessage({
          action: 'history:itemDownload',
          args: {
            uid: this.resource.getUid(),
            title: this.resource.getTitle(),
            userName: this.resource.getUserName(),
            cover: this.resource.getCover(),
            url: this.resource.getUrl(),
            type: this.resource.getType(),
            r: this.resource.getR(),
            downloaded_at: moment().unix(),
          }
        });
      });
    },

    pageSelectorSelectHandler(selectedPages, selectedIndexes) {
      this.selectedIndexes = selectedIndexes;
    },

    pageSelectorDownloadHandler() {
      this.download();
    },

    disableGuide() {
      browser.storage.local.set({
        guideShowed: true
      });
    },

    passToPixivOmina() {
      window.location.assign(`pixiv-omina://create-download?url=${encodeURIComponent(window.location.href)}`);
    }
  }
}
</script>

<style lang="scss">
.ptk__pixiv-omina__btn {
  margin-left: 5px;
}

.ptk__downloaded-dot {
  background: green;
  display: inline-block;
  width: 8px;
  height: 8px;
}

.ptk__download-added-notice {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgb(0, 150, 250, .75);
  color: #fff;
  font-size: 14px;
  border-radius: 999px;
  box-shadow: 0 0 5px rgba(0, 0, 0, .3);
  padding: 10px 15px;
}
</style>
