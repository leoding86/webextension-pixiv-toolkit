<template>
  <control-panel v-if="showApp" :lastError="lastError"
    :panelStyle="browserItems.downloadPanelStyle"
    :panelPosition="browserItems.downloadPanelPosition"
  >
    <ptk-button @click="download">Download</ptk-button>
    <page-selector v-if="pages && pages.length > 0"
      :items="pages"
      @select="pageSelectorSelectHandler"
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
import AbstractResource from "@/content_scripts/modules/PageResources/AbstractResource";

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
       * @type {Object} Dynamic context
       */
      context: {
        url: '',
        type: '',
        pages: [],
      },

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
      return this.context.type && this.context.url;
    },

    /**
     * @returns {string[]}
     */
    pages() {
      return this.context.pages;
    }
  },

  created() {
    this.illustHistoryPort = IllustHistoryPort.getInstance();

    /**
     * @type {Adapter}
     */
    this.adapter = new Adapter();

    /**
     * @type {AbstractResource}
     */
    this.resource = null;

    window.$eventBus.$on('pagechange', async page => {
      this.abortAdapterParse();

      if (page.type) {
        this.context.type = page.type;
        this.resource = await this.adapter.getResource(page.type, page.url);
        this.context = Object.assign({}, this.context, this.resource.getContext());
      }
    });
  },

  methods: {
    abortAdapterParse() {
      this.adapter.abort();
      this.context = { url: null, type: null };
      this.selectedIndexes = [];
    },

    download() {
      browser.runtime.sendMessage({
        action: 'download:addDownload',
        args: {
          type: this.type,
          url: this.url,
          selectedIndexes: this.selectedIndexes,
        },
      });
    },

    pageSelectorSelectHandler(selectedPages, selectedIndexes) {
      this.selectedIndexes = selectedIndexes;
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
