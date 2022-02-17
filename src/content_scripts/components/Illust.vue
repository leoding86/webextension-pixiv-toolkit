<template>
  <div class="ptk__tool" v-if="show">
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
        <ptk-button @click="selectAll">{{ tl('_select_all') }}</ptk-button>
        <ptk-button @click="unselectAll">{{ tl('_unselect_all') }}</ptk-button>
        <ptk-button @click="selectInvert">{{ tl('_select_invert') }}</ptk-button>
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
  </div>
</template>

<script>
import Button from '@/content_scripts/components/Button'
import Dialog from '@/content_scripts/components/Dialog'
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin'
import IllustTool from '@/content_scripts/illust/Illust'
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort'
import pathjoin from '@/modules/Util/pathjoin';

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

  created() {
    this.createSubdirectory = this.browserItems.illustrationCreateSubdirectory;
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

      /**
       * Create download buttons from download chunks
       */
      vm.chunks.forEach((chunk, i) => {
        buttonsInfo[i] = {
          index: i,
          text: '',
          downloadStatus: 0,
          chunk,
          isSingle: false,
          type: ''
        };

        if (chunk.start >= 0 && chunk.end >= 0) {
          buttonsInfo[i].isSingle = chunk.start === chunk.end;
        }

        buttonsInfo[i].text = ((buttonsInfo[i].isSingle && !this.alwaysPack) ? this.tl('_dl_image') : vm.getChunkTitle(chunk, this.tl('_download'))) + (vm.isSaved ? ' ✔️' : '')
      });

      vm.buttonsInfo = buttonsInfo;
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

    getChunkTitle(chunk, text) {
      if (chunk.start === chunk.end) {
        return text + ' p' + (chunk.start + 1)
      } else {
        return text + ' p' + (chunk.start - 0 + 1) + '-p' + (chunk.end - 0 + 1);
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
      /**
       * Initial savePath start with relative root path
       */
      let savePath = this.browserItems.illustrationRelativeLocation ?
        this.getSubfolder(this.browserItems.illustrationRelativeLocation, this.tool.context) :
        this.browserItems.downloadRelativeLocation;

      savePath = pathjoin(savePath, '/');

      if (savePath.indexOf('/') === 0) {
        savePath = savePath.substr(1);
      }

      if ((files.length === 1 && this.alwaysPack) || (files.length > 1 && this.packFiles)) {
        this.tool.getPackedFile({files}).then(result => {
          /**
           * Download zip file
           */
          this.downloadFile({
            src: result.data,
            filename: result.filename,
            folder: savePath
          })
          .then(() => this.updateDownloadStat('illust'));
        });
      } else {
        if (this.createSubdirectory === 1 || (this.createSubdirectory === 2 && files.length > 1)) {
          savePath = pathjoin(savePath, this.tool.relativePath, '/');
        } else {
          savePath = pathjoin(savePath, '/');
        }

        /**
         * Cache files and change button type
         */
        this.downloadMultipleFiles(files, { savePath })
        .then(() => this.updateDownloadStat('illust'));
      }

      this.saveDownloadRecord({ illust: 1 });
    },

    downloadButtonClicked(buttonInfo) {
      if (!this.allowDownload(this.isSaved)) {
        return;
      }

      if (buttonInfo.downloadStatus === 1) {
        return;
      }

      /**
       * Marking download status to downloading
       */
      buttonInfo.downloadStatus = 1;

      let indexes = [],
          start = Math.min(buttonInfo.chunk.start, buttonInfo.chunk.end),
          end = Math.max(buttonInfo.chunk.start, buttonInfo.chunk.end);

      while (start <= end) {
        indexes.push(start);
        start++;
      }

      this.tool.downloadFiles({ indexes }, buttonInfo).then(files => {
        /**
         * Reset download status to ready and update button's type to success
         */
        this.updateButtonInfo(buttonInfo, { type: 'succcess', downloadStatus: 0 });

        /**
         * Save downloaded files
         */
        this.saveDownloadedFiles(files, buttonInfo);
      }).catch(error => {
        console.error(error);
      });
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
        let text = this.getChunkTitle(buttonInfo.chunk, this.tl('_redownload'));

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
            this.selectedImageIndexes.push(parseInt(idx));
          }
        }

        this.$set(this.images, idx, image);
      }
    },

    selectAll() {
      for (let idx in this.images) {
        this.$set(this.images, idx, Object.assign(this.images[idx], { selected: true }));
        this.selectedImageIndexes.push(parseInt(idx));
      }
    },

    unselectAll() {
      for (let idx in this.images) {
        this.$set(this.images, idx, Object.assign(this.images[idx], { selected: false }));
        this.selectedImageIndexes = [];
      }
    },

    selectInvert() {
      /**
       * Clear selections
       */
      this.selectedImageIndexes = [];

      for (let idx in this.images) {
        let selectedValue = this.images[idx].hasOwnProperty('selected') ?
          !this.images[idx].selected : true;
        this.$set(this.images, idx, Object.assign(this.images[idx], { selected: selectedValue }));

        if (selectedValue) {
          this.selectedImageIndexes.push(parseInt(idx));
        }
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
