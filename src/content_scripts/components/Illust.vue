<template>
  <div v-if="show">
    <ptk-button
      v-for="buttonInfo in buttonsInfo"
      :key="buttonInfo.index"
      :text="buttonInfo.text"
      :type="buttonInfo.type"
      @click="downloadButtonClicked(buttonInfo)"
    ></ptk-button>
  </div>
</template>

<script>
import Button from '@/content_scripts/components/Button'
import formatName from '@/modules/Util/formatName'
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin'
import IllustTool from '@/content_scripts/illust/Illust'
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort'

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    'ptk-button': Button
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
      forceDownload: false
    }
  },

  mounted() {
    let vm = this,
        buttonsInfo = {}

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
      illustrationKeepPageNumber: this.browserItems.illustrationKeepPageNumber,
      pageNumberStartWithOne: this.browserItems.illustrationPageNumberStartWithOne,
      processors: parseInt(this.browserItems.downloadTasksWhenDownloadingImages)
    }).init()

    this.chunks = this.illustTool.chunks

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
          text: (isSingle ? 'DL image' : vm.getChunkTitle(chunk, { singular: 'DL page', plural: 'DL pages'})) + (vm.isSaved ? ' ✔️' : ''),
          filename: null,
          downloadStatus: 0,
          chunk: chunk,
          isSingle: isSingle,
          type: '',
          blob: null
        }
      })

      vm.buttonsInfo = buttonsInfo
    },

    saveDownloadRecord(record) {
      this.isSaved = true;
      this.downloadRecordPort.saveDownloadRecord({ id: this.illustTool.getId(), type: DownloadRecordPort.illustType, record });
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

    downloadButtonClicked(buttonInfo) {
      if (!this.allowDownload(this.isSaved)) {
        return;
      }

      if (buttonInfo.downloadStatus === 0) {
        buttonInfo.downloadStatus = 1;

        if (buttonInfo.isSingle) {
          this.tool.downloadFile(
            this.tool.context.pages[0].urls.original,
            buttonInfo,
            this.browserItems.pageNumberStartWithOne ? 1 : 0
          );
        } else {
          this.tool.downloadChunk(buttonInfo.chunk, buttonInfo);
        }
      } else if (buttonInfo.downloadStatus === 2) {
        this.updateButtonInfo(buttonInfo, { type: 'success' });

        this.downloadFile(buttonInfo.blob, buttonInfo.filename, {
          folder: this.getSubfolder(this.browserItems.illustrationRelativeLocation, this.tool.context),
          statType: 'illust'
        });

        this.saveDownloadRecord({ illust: 1 });
      }
    },

    downloadProgressEventHandle({ progress, failCount }, buttonInfo) {
      this.updateButtonInfo(buttonInfo, {
        text: `Downloading ${Math.round(progress * 100)}%` + (failCount > 0 ? ` (F:${failCount})` : '')
      });
    },

    downloadErrorEventHandle() {
      //
    },

    downloadFinishEventHandle({ blob, filename }, buttonInfo) {
      let text = this.getChunkTitle(buttonInfo.chunk, { singular: 'Save page', plural: 'Save pages'})

      this.updateButtonInfo(buttonInfo, {
        text: (buttonInfo.isSingle ? 'Save image' : text) + ' ✔️',
        blob: blob,
        filename: filename,
        downloadStatus: 2,
        type: 'success'
      });

      this.downloadFile(buttonInfo.blob, filename, {
        folder: this.getSubfolder(this.browserItems.illustrationRelativeLocation, this.illustTool.context),
        statType: 'illust',
      });

      this.saveDownloadRecord({ illust: 1 });
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
    }
  }
}
</script>
