<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-08 08:43:42
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 17:20:18
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
      <ptk-button @click="download({ ugoiraConvertType: 'apng' })"
      >{{ tl('_download_apng') }}{{ apngProgress }}</ptk-button>

      <ptk-button @click="download({ ugoiraConvertType: 'gif' })"
      >{{ tl('_download_gif') }}{{ gifProgress }}</ptk-button>

      <ptk-button @click="download({ ugoiraConvertType: 'webm' })"
      >{{ tl('_download_webm') }}{{ webmProgress }}</ptk-button>

      <ptk-button @click="download({ ugoiraConvertType: 'mp4' })"
      >{{ tl('_download_mp4') }}{{ mp4Progress }}</ptk-button>

      <ptk-button @click="download"
      >{{ tl('_download_custom') }}{{ customProgress }}</ptk-button>
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
    <ptk-button v-if="browserItems.showPixivOmina"
      class="ptk__pixiv-omina__btn"
      @click="passToPixivOmina"
    >Pixiv Omina</ptk-button>
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
import DownloadTaskObserver from '../modules/DownloadTaskObserver';
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

    this.downloadTaskObserver = DownloadTaskObserver.getObserver();
    this.downloadTaskObserver.addListener('status', message => {
      const downloadTasksStatus = message.downloadTasksStatus;

      if (downloadTasksStatus && downloadTasksStatus.length > 0) {
        downloadTasksStatus.forEach(task => {
          if (task.type === 'PIXIV_UGOIRA') {
            this.ugoiraTaskProgresses[task.convertType] = Object.assign(
              {}, this.ugoiraTaskProgresses[task.convertType], { d: task.progress, p: task.processProgress }
            );
          } else {
            this.generalTaskProgress = task.progress;
          }
        });
      }
    });

    window.$eventBus.$on('pagechange', page => {
      this.initialProgress();

      this.abortAdapterParse();

      if (page) {
        this.resource = window.$app.resource;
        this.observeDownloadTask();

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
    this.downloadTaskObserver.stopObserve();
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

    observeDownloadTask() {
      if (this.isUgoira) {
        this.downloadTaskObserver.observeDownloadTasks(
          ['gif', 'apng', 'mp4', 'webm', 'custom'].map(type => this.resource.getDownloadTaskId(type))
        );
      } else {
        this.downloadTaskObserver.observeDownloadTasks([this.resource.getDownloadTaskId()]);
      }
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

    async downloadWithDownloadManager({ ugoiraConvertType, redownload = false }) {
      await this.ensureDownloadManagerOpen(async () => {
        const args = this.getDownloadArgs({ ugoiraConvertType });
        args.options.redownload = redownload;

        let response = await browser.runtime.sendMessage({
          action: 'download:addDownload',
          args
        });

        if (!response.result && redownload === false) {
          if (response.errorName === 'DownloadTaskExistsError') {
            if (window.confirm(this.tl(`_the_resource_is_already_in_download_manager`))) {
              this.downloadWithDownloadManager({ ugoiraConvertType, redownload: true })
            }

            return;
          } else {
            alert(this.tl('_unkown_error') + ': ' + response.errorName);
          }
          return;
        } else {
          this.displayNotice(this.tl('_download_added'));
        }

        /**
         * Save download history
         */
        browser.runtime.sendMessage({
          to: 'ws',
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

    download({ ugoiraConvertType } = {}) {
      this.downloadWithDownloadManager({ ugoiraConvertType });
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
