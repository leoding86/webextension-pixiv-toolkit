<template>
  <div v-if="show">
    <ptk-button
      v-for="buttonInfo in buttonsInfo"
      :key="buttonInfo.index"
      :text="buttonInfo.text"
      :type="buttonInfo.type"
      @click="downloadButtonClicked(buttonInfo)"
    ></ptk-button>
    <ptk-button
      :text="tl('_select_and_dl')"
      @click="openSelectionDialog()"
    ></ptk-button>
    <ptk-dialog
      :show.sync="showSelectionDialog"
    >
      <template slot="head">
        {{ tl('_select_images_you_want_to_download') }}
      </template>
      <div class="ptk__images-selection">
        <div class="ptk__image-preview"
          :class="{ 'ptk__image-preview--selected': image.selected }"
          :style="{
            'background': `url(${image.urls.thumb_mini}) center center no-repeat`,
            'background-size': '95% 95%'
          }"
          v-for="(image, idx) in images"
          :key="idx"
          @click="selectImage(idx)"
        >
          <div class="ptk__image-preview--download">
            <svg viewBox="0 0 120 120">
              <polyline points="60,105 60,8"></polyline>
              <polyline points="10,57 60,8 110,57"></polyline>
            </svg>
          </div>
        </div>
      </div>
      <template slot="foot">
        <ptk-button @click="downloadSelectedImages" :disabled="selectedImageIndexes.length < 1">
          <template v-if="downloadSelectedImagesStatus === 1">
            {{ downloadSelectedImagesNotice }}
          </template>
          <template v-else>
            {{ tl('_download') }}
          </template>
        </ptk-button>
        <ptk-button @click="closeSelectionDialog">{{ tl('_close') }}</ptk-button>
      </template>
    </ptk-dialog>
  </div>
</template>

<script>
import Button from '@/content_scripts/components/Button'
import Dialog from '@/content_scripts/components/Dialog'
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin'
import IllustTool from '@/content_scripts/illust/Illust'
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort'

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    'ptk-button': Button,
    'ptk-dialog': Dialog,
  },

  props: {
    tool: IllustTool,
  },

  data() {
    return {
      illustTool: null,
      show: false,
      chunks: [],
      buttonsInfo: {},
      isSaved: false,
      forceDownload: false,
      downloadSelectedImagesStatus: 0, // 0: pending, 1: downloading
      downloadSelectedImagesNotice: '',
      showSelectionDialog: false,
      downloadSelectedImageButton: {},
      images: [],
      selectedImageIndexes: [],
      packFiles: false
    }
  },

  computed: {
    alwaysPack() {
      return this.browserItems.alwaysPack;
    }
  },

  mounted() {
    /**
     * @var {IllustTool}
     */
    this.illustTool = this.tool;

    /**
     * @var {DownloadRecordPort}
     */
    this.downloadRecordPort = DownloadRecordPort.getInstance();

    this.downloadRecordPort.port.onMessage.addListener(this.handleDownloadRecord);

    this.downloadRecordPort.getDownloadRecord({ id: this.illustTool.getId(), type: DownloadRecordPort.illustType });

    this.illustTool.initOptions({
      splitSize: 999,
      illustrationRenameFormat: this.browserItems.illustrationRenameFormat,
      illustrationImageRenameFormat: this.browserItems.illustrationImageRenameFormat,
      pageNumberStartWithOne: this.browserItems.illustrationPageNumberStartWithOne,
      illustrationPageNumberLength: this.browserItems.illustrationPageNumberLength,
      processors: parseInt(this.browserItems.downloadTasksWhenDownloadingImages)
    }).init();

    this.packFiles = this.browserItems.downloadPackFiles;

    this.chunks = this.illustTool.chunks

    this.images = this.illustTool.context.pages

    this.initDownloadButtons()

    this.tool.addListener('download-progress', this.downloadProgressEventHandle);

    this.tool.addListener('download-error', this.downloadErrorEventHandle);

    this.tool.addListener('download-finish', this.downloadFinishEventHandle);

    browser.runtime.onConnect.addListener(this.handleConnect);

    this.show = true
  },

  beforeDestroy() {
    browser.runtime.onConnect.removeListener(this.handleConnect);
    this.downloadRecordPort.port.onMessage.removeListener(this.handleDownloadRecord);
    this.tool.removeListener('download-progress', this.downloadProgressEventHandle);
    this.tool.removeListener('download-finish', this.downloadFinishEventHandle);
  },

  watch: {
    isSaved(val) {
      Object.keys(this.buttonsInfo).forEach(key => {
        let buttonInfo = this.buttonsInfo[key];

        if (val === true && buttonInfo.text.indexOf(' ✔️') < 0) {
          this.updateButtonInfo(buttonInfo, { text: buttonInfo.text + ' ✔️' });
        } else if (val === false && buttonInfo.text.indexOf(' ✔️') > -1) {
          this.updateButtonInfo(buttonInfo, { text: buttonInfo.text.replace(' ✔️', '')});
        }
      });
    }
  },

  methods: {
    initDownloadButtons() {
      /**
       * @param {this}
       */
      let vm = this,
          buttonsInfo = {};

      vm.chunks.forEach((chunk, i) => {
        let isSingle = vm.illustTool.isSingle()

        buttonsInfo[i] = {
          index: i,
          text: ((isSingle && !this.alwaysPack) ? this.tl('_dl_image') : vm.getChunkTitle(chunk, { singular: this.tl('_dl_page'), plural: this.tl('_dl_pages')})) + (vm.isSaved ? ' ✔️' : ''),
          downloadStatus: 0,
          chunk: chunk,
          isSingle: isSingle,
          type: '',
          files: []
        }
      })

      vm.buttonsInfo = buttonsInfo
    },

    saveDownloadRecord(record) {
      this.isSaved = true;
      this.downloadRecordPort.saveDownloadRecord({
        id: this.illustTool.getId(),
        type: DownloadRecordPort.illustType,
        record: Object.assign({
          title: this.tool.getTitle(),
          userId: this.tool.getUserId(),
          userName: this.tool.getUserName(),
          thumb: this.tool.getThumb(),
          isR: this.tool.isR()
        }, record)
      });
    },

    allowDownload(isSaved) {
      if (isSaved && this.browserItems.askDownloadSavedWork && !this.forceDownload) {
        if (window.confirm(this.tl('_this_work_may_has_been_saved'))) {
          this.forceDownload = true;
        } else {
          return false;
        }
      }

      return true;
    },

    updateButtonInfo(buttonInfo, data) {
      this.$set(
        this.buttonsInfo,
        buttonInfo.index,
        Object.assign(buttonInfo, data)
      )
    },

    getChunkTitle(chunk, { singular, plural }) {
      if (chunk.start === chunk.end) {
        return singular + ' ' + (chunk.start + 1)
      } else {
        return plural + ' ' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1);
      }
    },

    /**
     * Download multiple files. The browser will popup a confirm dialog for user
     * for asking user if he/she agree to download multiple files from the website.
     * The user MUST allow it, then the browser will process the download.
     * @property {object[]} files
     * @returns {void}
     */
    saveDownloadedFiles(files) {
      let savePath = this.getSubfolder(
        this.browserItems.illustrationRelativeLocation, this.tool.context
      ) + '/';

      if (savePath.indexOf('/') === 0) {
        savePath = savePath.substr(1);
      }

      if (this.packFiles || (files.length === 1 && this.alwaysPack)) {
        this.tool.getPackedFile({files}).then(file => {
          /**
           * Download zip file
           */
          this.downloadFile(file.data, file.filename, {
            folder: savePath,
            statType: 'illust'
          });
        });
      } else {
        savePath += this.tool.relativePath + '/';

        /**
         * Cache files and change button type
         */

        files.forEach(file => {
          this.downloadFile(
            new Blob([file.data], { type: file.mimeType }),
            file.filename,
            {
              folder: savePath,
              statType: 'illust'
            }
          );
        });
      }

      this.saveDownloadRecord({ illust: 1 });
    },

    downloadButtonClicked(buttonInfo) {
      if (!this.allowDownload(this.isSaved)) {
        return;
      }

      if (buttonInfo.downloadStatus === 0) {
        buttonInfo.downloadStatus = 1;

        let indexes = [],
            start = Math.min(buttonInfo.chunk.start, buttonInfo.chunk.end),
            end = Math.max(buttonInfo.chunk.start, buttonInfo.chunk.end);

        while (start <= end) {
          indexes.push(start);
          start++;
        }

        this.tool.downloadFiles({ indexes }, buttonInfo).then(files => {
          this.updateButtonInfo(buttonInfo, { files });
          this.saveDownloadedFiles(files, buttonInfo);
        });

        this.updateButtonInfo(buttonInfo, { type: 'succcess' });
      } else if (buttonInfo.downloadStatus === 2) {
        this.saveDownloadedFiles(buttonInfo.files, buttonInfo);
      }
    },

    downloadProgressEventHandle({ progress, failCount }, buttonInfo, extra) {
      let progressNotice = `${this.tl('_downloading')} ${Math.round(progress * 100)}%` + (failCount > 0 ? ` (F:${failCount})` : '');

      if (extra && extra.selected === true) {
        this.downloadSelectedImagesNotice = progressNotice;
      } else {
        this.updateButtonInfo(buttonInfo, {
          text: progressNotice
        });
      }
    },

    downloadErrorEventHandle() {
      //
    },

    downloadFinishEventHandle(buttonInfo, extra) {
      if (extra && extra.selected === true) {
        /**
         * Initial properties for downloading selected images
         */
        this.downloadSelectedImagesStatus = 0;
        this.downloadSelectedImagesNotice = '';
      } else {
        let text = this.getChunkTitle(
          buttonInfo.chunk, { singular: this.tl('_save_page'), plural: this.tl('_save_pages') }
        );

        this.updateButtonInfo(buttonInfo, {
          text: (buttonInfo.isSingle ? this.tl('_save_image') : text) + ' ✔️',
          downloadStatus: 2,
          type: 'success'
        });
      }
    },

    handleDownloadRecord(message, port) {
      if (message.channel === DownloadRecordPort.portName + ':get-download-record' && message.error === undefined) {
        this.isSaved = true;
      }
    },

    handleConnect(port) {
      let self = this;

      if (port.name === 'popup') {
        port.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === 'fetch-info') {
            port.postMessage({
              info: self.illustTool.context
            })
          }
        })
      }
    },

    openSelectionDialog() {
      this.showSelectionDialog = true;
    },

    selectImage(idx) {
      if (this.downloadSelectedImagesStatus === 1) {
        alert('Please wait download complete');
      } else {
        let image = this.images[idx];

        if (image.selected) {
          image.selected = false;

          let index = this.selectedImageIndexes.indexOf(idx);

          if (index > -1) {
            this.selectedImageIndexes.splice(index, 1);
          }
        } else {
          image.selected = true;

          if (this.selectedImageIndexes.indexOf(idx) < 0) {
            this.selectedImageIndexes.push(idx);
          }
        }

        this.$set(this.images, idx, image);
      }
    },

    closeSelectionDialog() {
      if (this.downloadSelectedImagesStatus === 1) {
        alert('Please wait download complete');
      } else {
        this.showSelectionDialog = false;
      }
    },

    downloadSelectedImages() {
      if (this.downloadSelectedImagesStatus === 0) {
        this.downloadSelectedImagesStatus = 1;
        this.downloadSelectedImagesNotice = this.tl('_pending');
        this.selectedImageIndexes.sort();

        this.tool.downloadFiles({ indexes: this.selectedImageIndexes, extra: {selected: true}}).then(files => {
          this.saveDownloadedFiles(files);
        });
      }
    }
  }
}
</script>

<style lang="scss">
.ptk__images-selection {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    stroke: #fff;
    fill: none;
    stroke-width: 10;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: rotate(180deg);
  }
}
.ptk__image-preview {
  width: 128px;
  height: 128px;

  img {
    display: block;
  }
}

.ptk__image-preview--selected {
  .ptk__image-preview--download {
    display: flex;
  }
}

.ptk__image-preview--download {
  display: none;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.33);
}
</style>
