<template>
  <div v-if="show" style="padding: 6px 0 0 20px;text-align:center">
    <ptk-button :text="resourceDownloadText" ref="zipButton"></ptk-button>
    <template v-if="resourceProgress === 100">
      <ptk-button :text="gifGenerateText" @click="gifButtonClicked"></ptk-button>
      <ptk-button :text="webGenerateText" @click="webmButtonClicked"></ptk-button>
    </template>
  </div>
</template>

<script>
import Button from "@/content_scripts/components/Button"
import formatName from "@/modules/Util/formatName"
import {
  permissions as browserPermissions,
  downloads as browserDownloads
} from "@/content_scripts/Browser"
import downloadFileMixin from "@/content_scripts/mixins/downloadFileMixin"

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    "ptk-button": Button
  },

  props: {
    tool: Object
  },

  data() {
    return {
      ugoiraTool: null,
      show: false,

      resourceProgress: 0,

      gifProgress: null,
      gifStatus: 0,
      gifUrl: null,

      webmProgress: null,
      webmStatus: 0,
      webmUrl: null
    }
  },

  computed: {
    resourceDownloadText() {
      return this.resourceProgress === 0
        ? "Preparing"
        : this.resourceProgress === 100
        ? "Download Zip"
        : 'Downloading ' + this.resourceProgress + "%"
    },

    gifGenerateText() {
      if (this.gifProgress === null) {
        return 'Generate GIF'
      }

      return this.gifProgress !== 1
        ? "Generating GIF" +
            (this.gifProgress > 0
              ? " " + Math.round(this.gifProgress * 100) + "%"
              : "")
        : "Download GIF"
    },

    webGenerateText() {
      if (this.webmProgress === null) {
        return 'Generate WebM'
      }

      return this.webmProgress !== 1
        ? "Generating WebM " +
            (this.webmProgress > 0
              ? " " + Math.round(this.webmProgress * 100) + "%"
              : "")
        : "Download WebM"
    }
  },

  mounted() {
    let vm = this

    this.ugoiraTool = this.tool

    this.ugoiraTool.event.addListener(
      "onProgress",
      this.onResourceDownloadProgressHandle
    )

    this.ugoiraTool.init().then(blob => {
      vm.$refs.zipButton.$el.addEventListener('click', () => {
        vm.downloadFile(URL.createObjectURL(blob), vm.getFilename() + '.zip')
      })

      this.ugoiraTool.gifGenerator.event.addListener("onProgress", progress => {
        vm.gifProgress = progress
      })

      this.ugoiraTool.gifGenerator.event.addListener("onFinish", blob => {
        vm.gifProgress = 1
        vm.gifStatus = 2
        vm.gifUrl = URL.createObjectURL(blob)

        let filename = formatName(thisApp.browserItems.ugoiraRenameFormat, this.ugoiraTool.context, this.ugoiraTool.context.illustId) + '.gif'

        if (thisApp.browserItems.ugoiraGenerateAndDownload) {
          vm.downloadFile(vm.gifUrl, vm.getFilename() + '.gif')
        }
      })

      this.ugoiraTool.webMGenerator.event.addListener("onProgress", progress => {
          vm.webmProgress = progress
        }
      )

      this.ugoiraTool.webMGenerator.event.addListener("onFinish", blob => {
        vm.webmProgress = 1
        vm.webmStatus = 2
        vm.webmUrl = URL.createObjectURL(blob)

        if (thisApp.browserItems.ugoiraGenerateAndDownload) {
          vm.downloadFile(vm.webmUrl, vm.getFilename() + '.webm')
        }
      })
    })

    this.show = true
  },

  beforeDestroy() {
    this.ugoiraTool.event.removeEventListener(
      "onProgress",
      this.onResourceDownloadProgressHandle
    )

    this.ugoiraTool.gifGenerator.event.removeEventListeners("onProgress")
    this.ugoiraTool.gifGenerator.event.removeEventListeners("onFinish")

    this.ugoiraTool.webMGenerator.event.removeEventListeners("onProgress")
    this.ugoiraTool.webMGenerator.event.removeEventListeners("onFinish")
  },

  methods: {
    onResourceDownloadProgressHandle(progress) {
      this.resourceProgress = Math.round(progress * 100)
    },

    gifButtonClicked() {
      if (this.gifStatus === 2) {

        this.downloadFile(this.gifUrl, this.getFilename() + '.gif')
        return
      } else if (this.gifStatus !== 0) {
        return
      }

      this.gifStatus = 1

      this.ugoiraTool.gifGenerator.generate()
    },

    webmButtonClicked() {
      if (this.webmStatus === 2) {
        this.downloadFile(this.webmUrl, this.getFilename() + '.webm')
        return
      } else if (this.webmStatus !== 0) {
        return
      }

      this.webmStatus = 1

      this.ugoiraTool.webMGenerator.generate()
    },

    getFilename() {
      return formatName(thisApp.browserItems.ugoiraRenameFormat, this.ugoiraTool.context, this.ugoiraTool.context.illustId)
    }
  }
}
</script>
