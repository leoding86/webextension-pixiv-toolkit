<template>
  <control-panel v-if="showApp" :lastError="lastError"
    :panelStyle="browserItems.downloadPanelStyle"
    :panelPosition="browserItems.downloadPanelPosition"
  >
    <ptk-button @click="download"
      :type="downloadButtonType"
    >{{ tl('_download') }}</ptk-button>
    <page-selector v-if="pages && pages.length > 1"
      :items="pages"
      @select="pageSelectorSelectHandler"
      @download="pageSelectorDownloadHandler"
    ></page-selector>
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
    }
  },

  created() {
    /**
     * @type {Adapter}
     */
    this.adapter = new Adapter();

    window.$eventBus.$on('pagechange', async page => {
      this.abortAdapterParse();

      if (page) {
        this.resource = await this.adapter.getResource(page.type, page.url);

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
          this.pages = this.resource.getPages();
        }

        this.checkIfDownloaded();
      }
    });
  },

  methods: {
    abortAdapterParse() {
      this.adapter.abort();
      this.resource = null;
      this.downloadedAt = 0;
      this.pages = this.selectedIndexes = [];
    },

    async checkDownloadManager() {
      let timeout = setTimeout(() => {
        alert(this.tl('_download_manager_isnt_open'));
        throw new RuntimeError('Download manager isn\'t open');
      }, 600);

      let response = await browser.runtime.sendMessage({
        action: 'download:checkIfDownloadManagerOpened'
      });

      if (response) {
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

    async download() {
      await this.checkDownloadManager();

      let response = await browser.runtime.sendMessage({
        action: 'download:addDownload',
        args: {
          unpackedResource: this.resource.unpack(),
          options: {
            selectedIndexes: this.selectedIndexes
          }
        },
      });

      console.log(response);

      if (!response.result) {
        if (response.errorName === 'DownloadTaskExistsError') {
          alert(this.tl(`_the_resource_is_already_in_download_manager`));
        } else {
          alert(this.tl('_unkown_error') + ': ' + response.errorName);
        }
        return;
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
</style>
