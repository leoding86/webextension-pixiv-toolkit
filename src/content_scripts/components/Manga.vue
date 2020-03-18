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
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort'
import MangaTool from '@/content_scripts/manga/Manga'

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    'ptk-button': Button
  },

  props: {
    tool: MangaTool,
  },

  data() {
    return {
      mangaTool: null,
      show: false,
      chunks: [],
      buttonsInfo: {},
      isSaved: false,
      forceDownload: false
    }
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

  mounted() {
    let vm = this,
        buttonsInfo = {}

    this.mangaTool = this.tool;

    /**
     * @var {DownloadRecordPort}
     */
    this.downloadRecordPort = DownloadRecordPort.getInstance();

    this.downloadRecordPort.port.onMessage.addListener(this.handleDownloadRecord);

    this.downloadRecordPort.getDownloadRecord({ id: this.mangaTool.getId(), type: DownloadRecordPort.illustType });

    this.mangaTool.initOptions({
      splitSize: this.browserItems.mangaPagesInChunk,
      mangaRenameFormat: this.browserItems.mangaRenameFormat,
      mangaImageRenameFormat: this.browserItems.mangaImageRenameFormat,
      pageNumberStartWithOne: this.browserItems.mangaPageNumberStartWithOne,
      processors: parseInt(this.browserItems.downloadTasksWhenDownloadingImages)
    }).init()

    this.chunks = this.mangaTool.chunks

    this.chunks.forEach((chunk, i) => {
      buttonsInfo[i] = {
        index: i,
        text: vm.getChunkTitle(chunk, { singular: 'DL page', plural: 'DL pages' }) + (vm.isSaved ? ' ✔️' : ''),
        filename: vm.mangaTool.getFilename(chunk),
        downloadStatus: 0,
        chunk: chunk,
        type: '',
        blob: null
      }
    })

    this.buttonsInfo = buttonsInfo

    this.tool.addListener('download-progress', this.downloadProgressEventHandle);

    this.tool.addListener('download-error', this.downloadErrorEventHandle);

    this.tool.addListener('download-finish', this.downloadFinishEventHandle);

    browser.runtime.onConnect.addListener(this.handleConnect);

    this.show = true
  },

  beforeDestroy() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
    this.downloadRecordPort.port.onMessage.removeListener(this.handleDownloadRecord);
    this.tool.removeListener('download-progress', this.downloadProgressEventHandle);
    this.tool.removeListener('download-error', this.downloadErrorEventHandle);
    this.tool.removeListener('download-finish', this.downloadFinishEventHandle);
  },

  methods: {
    saveDownloadRecord(record) {
      this.isSaved = true;
      this.downloadRecordPort.saveDownloadRecord({ id: this.mangaTool.getId(), type: DownloadRecordPort.illustType, record });
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

    getChunkTitle(chunk, { singular, plural }) {
      if (chunk.start === chunk.end) {
        return singular + ' ' + (chunk.start + 1)
      } else {
        return plural + ' ' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1);
      }
    },

    updateButtonInfo(buttonInfo, data) {
      this.$set(this.buttonsInfo, buttonInfo.index, Object.assign(buttonInfo, data));
    },

    downloadButtonClicked(buttonInfo) {
      if (!this.allowDownload(this.isSaved)) {
        return;
      }

      if (buttonInfo.downloadStatus === 0) {
        buttonInfo.downloadStatus = 1;

        this.mangaTool.downloadChunk(buttonInfo.chunk, buttonInfo);
      } else if (buttonInfo.downloadStatus === 2) {
        this.updateButtonInfo(buttonInfo, { type: 'success' });

        this.downloadFile(buttonInfo.blob, this.getFilename(buttonInfo.chunk), {
          folder: this.getSubfolder(this.browserItems.mangaRelativeLocation, this.mangaTool.context),
          statType: 'manga'
        });

        this.saveDownloadRecord({ manga: 1 });
      }
    },

    downloadProgressEventHandle({ progress, failCount}, buttonInfo) {
      this.updateButtonInfo(buttonInfo, {
        text: `Downloading ${Math.round(progress * 100)}%` + (failCount > 0 ? ` (F:${failCount})` : '')
      });
    },

    downloadErrorEventHandle() {
      //
    },

    downloadFinishEventHandle(blob, buttonInfo) {
      let text = this.getChunkTitle(buttonInfo.chunk, { singular: 'Save page', plural: 'Save pages' })

      this.updateButtonInfo(buttonInfo, {
        text: text,
        blob: blob,
        downloadStatus: 2
      });

      this.updateButtonInfo(buttonInfo, { type: 'success' });

      this.downloadFile(buttonInfo.blob, this.getFilename(buttonInfo.chunk), {
        folder: this.getSubfolder(this.browserItems.mangaRelativeLocation, this.mangaTool.context),
        statType: 'manga',
      });

      this.saveDownloadRecord({ manga: 1 });
    },

    getFilename(chunk) {
      return formatName(this.browserItems.mangaRenameFormat, this.mangaTool.context, this.mangaTool.context.illustId) + '_' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1) + '.zip'
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
              info: self.mangaTool.context
            })
          }
        })
      }
    }
  }
}
</script>
