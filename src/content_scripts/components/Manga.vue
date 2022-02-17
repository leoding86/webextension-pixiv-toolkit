<template>
  <div class="ptk__tool" v-if="show">
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
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin'
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort'
import MangaTool from '@/content_scripts/manga/Manga'
import pathjoin from '@/modules/Util/pathjoin'

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
      forceDownload: false,
      packFiles: false
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
      mangaPageNumberLength: this.browserItems.mangaPageNumberLength,
      processors: parseInt(this.browserItems.downloadTasksWhenDownloadingImages)
    }).init()

    this.packFiles = this.browserItems.downloadPackFiles;

    this.chunks = this.mangaTool.chunks

    /**
     * Create download buttons from download chunks
     */
    this.chunks.forEach((chunk, i) => {
      buttonsInfo[i] = {
        index: i,
        text: vm.getChunkTitle(chunk, this.tl('_download')) + (vm.isSaved ? ' ✔️' : ''),
        downloadStatus: 0,
        chunk: chunk,
        type: '',
        files: []
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
      this.downloadRecordPort.saveDownloadRecord({
        id: this.mangaTool.getId(),
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

    getChunkTitle(chunk, text) {
      let offset = this.mangaTool.pageNumberStartWithOne ? 1 : 0;
      let start = parseInt(chunk.start) + offset, end = parseInt(chunk.end) + offset;

      if (start === end) {
        return text + ' p' + start;
      } else {
        return text + ' p' + start + '-p' + end;
      }
    },

    updateButtonInfo(buttonInfo, data) {
      this.$set(this.buttonsInfo, buttonInfo.index, Object.assign(buttonInfo, data));
    },

    /**
     * Download multiple files. The browser will popup a confirm dialog for user
     * for asking user if he/she agree to download multiple files from the website.
     * The user MUST allow it, then the browser will process the download.
     * @param {object[]} files
     * @param {{start: number, end: number}}
     * @returns {void}
     */
    saveDownloadedFiles(files, chunk) {
      /**
       * Initial savePath start with relative root path
       */
      let savePath = this.browserItems.mangaRelativeLocation ?
        this.getSubfolder(this.browserItems.mangaRelativeLocation, this.tool.context) :
        this.browserItems.downloadRelativeLocation;

      savePath = pathjoin(savePath, '/');

      if (savePath.indexOf('/') === 0) {
        savePath = savePath.substr(1);
      }

      if (this.packFiles || (files.length === 1 && this.alwaysPack)) {
        this.tool.getPackedChunkFile(files, chunk).then(file => {
          /**
           * Download zip file
           */
          this.downloadFile({
            src: file.data,
            filename: file.filename,
            folder: savePath,
          })
          .then(() => this.updateDownloadStat('manga'));
        });
      } else {
        savePath = pathjoin(savePath, this.tool.relativePath, '/');

        /**
         * Cache files and change button type
         */
        this.downloadMultipleFiles(files, { savePath })
        .then(() => this.updateDownloadStat('manga'));
      }

      this.saveDownloadRecord({ manga: 1 });
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
      this.updateButtonInfo(buttonInfo, { downloadStatus: 1 });

      this.mangaTool.downloadChunk(buttonInfo.chunk, buttonInfo).then(files => {
        /**
         * Reset download status to ready and update button's type to success
         */
        this.updateButtonInfo(buttonInfo, { type: 'success', downloadStatus: 0 });

        /**
         * Save downloaded files
         */
        this.saveDownloadedFiles(files, buttonInfo.chunk);
      }).catch(error => {
        console.error(error);
      });
    },

    downloadProgressEventHandle({ progress, failCount}, buttonInfo) {
      this.updateButtonInfo(buttonInfo, {
        text: `Downloading ${Math.round(progress * 100)}%` + (failCount > 0 ? ` (F:${failCount})` : '')
      });
    },

    downloadErrorEventHandle() {
      //
    },

    downloadFinishEventHandle(buttonInfo, extra) {
      let text = this.getChunkTitle(buttonInfo.chunk, this.tl('_redownload'))

      this.updateButtonInfo(buttonInfo, {
        text: text + ' ✔️',
        downloadStatus: 2
      });

      this.updateButtonInfo(buttonInfo, { type: 'success' });
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
