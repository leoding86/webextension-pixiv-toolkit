<template>
  <div v-if="show" style="padding: 6px 0 0 20px;text-align:center;">
    <ptk-button
      v-for="buttonInfo in buttonsInfo"
      :key="buttonInfo.index"
      :text="buttonInfo.text"
      @click="downloadButtonClicked(buttonInfo)"></ptk-button>
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
      splitSize: window.thisApp.browserItems.mangaPagesInChunk,
      mangaRenameFormat: window.thisApp.browserItems.mangaRenameFormat,
      mangaImageRenameFormat: window.thisApp.browserItems.mangaImageRenameFormat
    }).init()

    this.chunks = this.mangaTool.chunks

    this.chunks.forEach((chunk, i) => {
      buttonsInfo[i] = {
        index: i,
        text: vm.getChunkTitle(chunk),
        filename: vm.mangaTool.getFilename(chunk),
        downloadStatus: 0,
        chunk: chunk
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
      return 'DL ' + (chunk.start) + '-' + (chunk.end)
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
        this.downloadFile(buttonInfo.url, this.getFilename(buttonInfo.chunk), {
          statType: 'manga'
        });
      }
    },

    updateProgress(buttonInfo) {
      let vm = this

      return queue => {
        let text = 'C:' + queue.complete + ' / F:' + queue.fail + ' / T:' + queue.total

        vm.$set(
          vm.buttonsInfo,
          buttonInfo.index,
          Object.assign(buttonInfo, {
            text: text
          })
        )
      }
    },

    onDone(buttonInfo) {
      let vm = this

      return blob => {
        let text = 'Save chunk ' + buttonInfo.chunk.start + '-' + buttonInfo.chunk.end

        vm.$set(
          vm.buttonsInfo,
          buttonInfo.index,
          Object.assign(buttonInfo, {
            text: text,
            url: URL.createObjectURL(blob),
            downloadStatus: 2
          })
        )

        if (thisApp.browserItems.mangaPackAndDownload) {
          vm.downloadFile(buttonInfo.url, vm.getFilename(buttonInfo.chunk), {
            statType: 'manga',
          });
        }
      }
    },

    getFilename(chunk) {
      return formatName(thisApp.browserItems.mangaRenameFormat, this.mangaTool.context, this.mangaTool.context.illustId) + '_' + chunk.start + '-' + chunk.end + '.zip'
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
