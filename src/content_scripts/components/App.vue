<template>
  <control-panel v-if="showApp" :lastError="lastError"
    :panelStyle="browserItems.downloadPanelStyle"
    :panelPosition="browserItems.downloadPanelPosition"
  >
    <ptk-button @click="download">Download</ptk-button>
    <page-selector v-if="pages && pages.length > 0"
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
      lastError: null,
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
    };
  },

  computed: {
    /**
     * @returns {boolean}
     */
    showApp() {
      return !!this.resource;
    },
  },

  created() {
    // this.illustHistoryPort = IllustHistoryPort.getInstance();

    /**
     * @type {Adapter}
     */
    this.adapter = new Adapter();

    window.$eventBus.$on('pagechange', async page => { console.log(page);
      this.abortAdapterParse();

      if (page) {
        this.resource = await this.adapter.getResource(page.type, page.url);

        /**
         * Save visit history
         */
        browser.runtime.sendMessage({
          action: 'visitHistory:addItem',
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
      }
    });
  },

  methods: {
    abortAdapterParse() {
      this.adapter.abort();
      this.resource = null;
      this.pages = this.selectedIndexes = [];
    },

    async checkDownloadManager() {
      let timeout = setTimeout(() => {
        alert(this.tl('_download_manager_isnt_open'));
        throw new RuntimeError('Download manager isn\'t open');
      }, 600);

      let response = await browser.runtime.sendMessage({
        action: 'util:checkDownloadManager'
      });

      if (!response) {
        alert(this.tl('_download_manager_isnt_open'));
        throw new RuntimeError('Download manager isn\'t open');
      } else {
        clearTimeout(timeout);
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

      /**
       * Save download history
       */
      browser.runtime.sendMessage({
        action: 'downloadHistory:addItem',
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
</style>
