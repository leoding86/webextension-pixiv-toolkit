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
      buttonsInfo: {}
    }
  },

  mounted() {
    let vm = this,
        buttonsInfo = {}

    this.mangaTool = this.tool

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
        text: vm.getChunkTitle(chunk),
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
  },

  methods: {
    getChunkTitle(chunk) {
      return 'DL pages ' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1);
    },

    updateButtonInfo(buttonInfo, data) {
      this.$set(this.buttonsInfo, buttonInfo.index, Object.assign(buttonInfo, data));
    },

    downloadButtonClicked(buttonInfo) {
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
          statType: 'manga'
        });
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
            statType: 'manga',
          });
        }
      }
    },

    getFilename(chunk) {
      return formatName(this.browserItems.mangaRenameFormat, this.mangaTool.context, this.mangaTool.context.illustId) + '_' + (chunk.start - 0 + 1) + '-' + (chunk.end - 0 + 1) + '.zip'
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
