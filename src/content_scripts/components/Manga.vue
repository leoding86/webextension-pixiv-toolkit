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
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort'

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    'ptk-button': Button
  },

  props: {
    tool: Object,
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

    this.mangaTool = this.tool

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
      pageNumberStartWithOne: this.browserItems.mangaPageNumberStartWithOne
    }).init()

    this.chunks = this.mangaTool.chunks

    this.chunks.forEach((chunk, i) => {
      buttonsInfo[i] = {
        index: i,
        text: vm.getChunkTitle(chunk) + (vm.isSaved ? ' ✔️' : ''),
        filename: vm.mangaTool.getFilename(chunk),
        downloadStatus: 0,
        chunk: chunk,
        type: ''
      }
    })

    this.buttonsInfo = buttonsInfo

    browser.runtime.onConnect.addListener(this.handleConnect);

    this.show = true
  },

  unmounted() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
    this.downloadRecordPort.port.onMessage.removeListener(this.handleDownloadRecord);
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

    getChunkTitle(chunk) {
      return 'DL pages ' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1);
    },

    updateButtonInfo(buttonInfo, data) {
      this.$set(this.buttonsInfo, buttonInfo.index, Object.assign(buttonInfo, data));
    },

    downloadButtonClicked(buttonInfo) {
      if (!this.allowDownload(this.isSaved)) {
        return;
      }

      let vm = this

      if (buttonInfo.downloadStatus === 0) {
        buttonInfo.downloadStatus = 1

        this.mangaTool.downloadChunk(buttonInfo.chunk, {
          onItemComplete: this.updateProgress(buttonInfo),
          onItemFail: this.updateProgress(buttonInfo),
          onDone: this.onDone(buttonInfo)
        })
      } else if (buttonInfo.downloadStatus === 2) {
        this.updateButtonInfo(buttonInfo, { type: 'success' });

        this.downloadFile(buttonInfo.url, this.getFilename(buttonInfo.chunk), {
          folder: this.getSubfolder(this.browserItems.mangaRelativeLocation, this.mangaTool.context),
          statType: 'manga'
        });

        this.saveDownloadRecord({ manga: 1 });
      }
    },

    updateProgress(buttonInfo) {
      let vm = this

      return queue => {
        let text = 'C:' + queue.complete + ' / F:' + queue.fail + ' / T:' + queue.total

        this.updateButtonInfo(buttonInfo, { text: text });
      }
    },

    onDone(buttonInfo) {
      let vm = this

      return blob => {
        let text = 'Save pages ' + (buttonInfo.chunk.start - 0 + 1) + '-' + (buttonInfo.chunk.end - 0 + 1)

        vm.updateButtonInfo(buttonInfo, {
          text: text,
          url: URL.createObjectURL(blob),
          downloadStatus: 2
        });

        if (vm.browserItems.mangaPackAndDownload) {
          vm.updateButtonInfo(buttonInfo, { type: 'success' });

          vm.downloadFile(buttonInfo.url, vm.getFilename(buttonInfo.chunk), {
            folder: this.getSubfolder(this.browserItems.mangaRelativeLocation, this.mangaTool.context),
            statType: 'manga',
          });

          vm.saveDownloadRecord({ manga: 1 });
        }
      }
    },

    getFilename(chunk) {
      return formatName(this.browserItems.mangaRenameFormat, this.mangaTool.context, this.mangaTool.context.illustId) + '_' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1) + '.zip'
    },

    handleDownloadRecord(message, port) {
      if (message.channel === DownloadRecordPort.port + ':get-download-record' && message.error === undefined) {
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
