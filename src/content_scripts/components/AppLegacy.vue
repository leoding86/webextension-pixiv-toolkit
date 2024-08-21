<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-08 08:43:42
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-21 13:24:36
-->
<template>
  <control-panel v-if="showApp" :lastError="lastError"
    :panelStyle="browserItems.downloadPanelStyle"
    :panelPosition="browserItems.downloadPanelPosition"
    :class="downloadButtonType"
  >
    <template v-if="!isUgoira">
      <ptk-button @click="download"
      >{{ tl('_download') }}{{ generalTaskProgressText }}</ptk-button>
    </template>
    <template v-else>
      <ptk-button @click="download({ ugoiraConvertType: 'gif' })"
      >{{ tl('_download_gif') }}{{ gifProgress }}</ptk-button>

      <ptk-button @click="download({ ugoiraConvertType: 'apng' })"
      >{{ tl('_download_apng') }}{{ apngProgress }}</ptk-button>

      <ptk-button @click="download({ ugoiraConvertType: 'webm' })"
      >{{ tl('_download_webm') }}{{ webmProgress }}</ptk-button>
    </template>
    <page-selector
      ref="pageSelector"
      v-if="pages && pages.length > 1"
      :items="pages"
      @select="pageSelectorSelectHandler"
      @download="pageSelectorDownloadHandler"
    ></page-selector>
    <div class="ptk__download-added-notice" v-show="showNotice">
      {{ this.noticeMessage }}
    </div>
    <ptk-button v-if="!isUndetermined && browserItems.showPixivOmina"
      class="ptk__pixiv-omina__btn"
      @click="passToPixivOmina"
    >Pixiv Omina</ptk-button>
    <ptk-button style="font-size:10px;padding:1px 20px;">
      <p style="margin:0;padding:0;">Legacy</p>
      <p style="margin:0;padding:0;">Mode</p>
    </ptk-button>
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
import moment from 'moment';
import ContentPageDownloadManager from '../modules/ContentPageDownloadManager';
import DownloadTaskExistsError from '@/errors/DownloadTaskExistsError';

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

      noticeMessage: '',

      ugoiraTaskProgresses: {
        'gif': { d: 0, p: 0 },
        'apng': { d: 0, p: 0 },
        'webm': { d: 0, p: 0 },
        'mp4': { d: 0, p: 0 },
        'custom': { d: 0, p: 0 }
      },

      generalTaskProgress: 0
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
    },

    apngProgress() {
      return this.ugoiraProgress('apng');
    },

    gifProgress() {
      return this.ugoiraProgress('gif');
    },

    webmProgress() {
      return this.ugoiraProgress('webm');
    },

    mp4Progress() {
      return this.ugoiraProgress('mp4');
    },

    customProgress() {
      return this.ugoiraProgress('custom');
    },

    generalTaskProgressText() {
      if (this.generalTaskProgress === 1) {
        return ' ✔';
      } else if (this.generalTaskProgress > 0) {
        return ' ' + (this.generalTaskProgress * 100).toFixed(2) + '%';
      } else {
        return '';
      }
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

    /**
     * @type {boolean} Indicate the status of opening download manager
     */
    this.openingDownloadManager = false;

    /**
     * @type {ContentPageDownloadManager}
     */
    this.downloadManager = ContentPageDownloadManager.create();
    this.downloadManager.addListener('error', error => {
      console.error(error);
    });
    this.downloadManager.addListener('update', downloadTasks => {
      downloadTasks.forEach(downloadTask => {
        if (downloadTask.type === 'PIXIV_UGOIRA') {
          const convertType = downloadTask.options.convertType.toLowerCase();
          if (this.ugoiraTaskProgresses[convertType]) {
            this.ugoiraTaskProgresses[convertType] = Object.assign(this.ugoiraTaskProgresses[convertType], {
              d: downloadTask.progress, p: downloadTask.processProgress
            });
          }
        } else {
          this.generalTaskProgress = downloadTask.progress;
        }
      });
    });

    window.$eventBus.$on('pagechange', page => {
      this.initialProgress();

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

  beforeDestroy() {
    this.downloadManager.exit();
  },

  methods: {
    initialProgress() {
      this.generalTaskProgress = 0;
      this.ugoiraTaskProgresses = {
        'gif': { d: 0, p: 0 },
        'apng': { d: 0, p: 0 },
        'webm': { d: 0, p: 0 },
        'mp4': { d: 0, p: 0 },
        'custom': { d: 0, p: 0 }
      };
    },

    ugoiraProgress(type) {
      const progress = this.ugoiraTaskProgresses[type];

      if (progress) {
        console.log(progress);
        if (progress.p === 1) {
          this.downloadButtonType = 'success';
          return ' ✔';
        } else if (progress.p > 0) {
          return ` (P:${(progress.p * 100).toFixed(2)}%)`;
        } else if (progress.d > 0) {
          return ` (D:${(progress.d * 100).toFixed(2)}%)`;
        }
      }

      return '';
    },

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
    async ensureDownloadManagerOpen(fnAfterOpen) {
      const checkResponse = await browser.runtime.sendMessage({
        to: 'ws',
        action: 'download:getDownloadManagerTab'
      });

      if (!checkResponse) {
        this.displayNotice(this.tl('_opening_download_manager'))
      }

      const response = await browser.runtime.sendMessage({
        to: 'ws',
        action: 'download:ensureDownloadManagerOpen'
      });

      if (response) {
        if (fnAfterOpen) {
          fnAfterOpen();
        }
      } else {
        this.displayNotice(this.tl('_cant_open_download_manager_please_open_manully'))
      }
    },

    async checkIfDownloaded() {
      let downloadedAt = await browser.runtime.sendMessage({
        to: 'ws',
        action: 'history:checkIfDownloaded',
        args: {
          uid: this.resource.getUid()
        }
      });

      if (downloadedAt) {
        this.downloadedAt = downloadedAt;
      }
    },

    getDownloadArgs({ ugoiraConvertType }) {
      return {
        unpackedResource: this.resource.unpack(),
        options: {
          ugoiraConvertType,
          selectedIndexes: this.selectedIndexes
        }
      };
    },

    async download({ ugoiraConvertType, selectedIndexes } = {}) {
      try {
        await this.downloadManager.addTask(this.resource, { ugoiraConvertType, selectedIndexes });
      } catch (error) {
        if (error instanceof DownloadTaskExistsError) {
          if (window.confirm(this.tl('_the_resource_is_already_in_download_manager'))) {
            this.downloadManager.addTask(this.resource, { ugoiraConvertType, selectedIndexes }, { redownload: true })
          }
        } else {
          throw error;
        }
      }
    },

    pageSelectorSelectHandler(selectedPages, selectedIndexes) {
      this.selectedIndexes = selectedIndexes;
    },

    pageSelectorDownloadHandler({ selectedPageIndexes }) {
      this.download({ selectedIndexes: selectedPageIndexes });
    },

    disableGuide() {
      browser.storage.local.set({
        guideShowed: true
      });
    },

    passToPixivOmina() {
      window.location.assign(`pixiv-omina://create-download?url=${encodeURIComponent(window.location.href)}`);
    },

    test() {
      const { createFFmpeg } = FFmpeg;
      this.ffmpeg = new createFFmpeg({
        log: true,
        corePath: browser.runtime.getURL('lib/ffmpeg/ffmpeg-core.js'),
      });
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

.ptk__container.success {
  .ptk__container__body-container {
    border-color: #00dc68;
  }
}
</style>
