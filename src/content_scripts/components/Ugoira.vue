<template>
  <div v-if="show">
    <ptk-button :text="resourceDownloadText" ref="zipButton"></ptk-button>
    <template v-if="resourceProgress === 100">
      <ptk-button :text="gifGenerateText" @click="gifButtonClicked"></ptk-button>
      <ptk-button :text="apngGenerateText" @click="apngButtonClicked"></ptk-button>
      <ptk-button :text="webGenerateText" @click="webmButtonClicked"
       v-if="!isBrowser('firefox')"></ptk-button>
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
import browser from '@/modules/Extension/browser'
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

      apngProgress: null,
      apngStatus: 0,
      apngUrl: null,

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
        : 'Downloading'
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

    apngGenerateText() {
      if (this.apngProgress === null) {
        return 'Generate APNG';
      }

      return this.apngStatus === 2
        ? "Download APNG" : ("Generating APNG " + Math.floor(this.apngProgress * 100) + '%');
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

    this.ugoiraTool = this.tool;

    this.resourceProgress = 1;

    this.ugoiraTool.init().then(blob => {
      vm.resourceProgress = 100;

      vm.$refs.zipButton.$el.addEventListener('click', () => {
        vm.downloadFile(URL.createObjectURL(blob), vm.getFilename() + '.zip', {
          statType: 'ugoira',
        });
      })

      this.ugoiraTool.gifGenerator.event.addListener("onProgress", progress => {
        vm.gifProgress = progress
      })

      this.ugoiraTool.gifGenerator.event.addListener("onFinish", blob => {
        vm.gifProgress = 1
        vm.gifStatus = 2
        vm.gifUrl = URL.createObjectURL(blob)

        if (thisApp.browserItems.ugoiraGenerateAndDownload) {
          vm.downloadFile(vm.gifUrl, vm.getFilename() + '.gif', {
            statType: 'ugoira',
          });
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
          vm.downloadFile(vm.webmUrl, vm.getFilename() + '.webm', {
            statType: 'ugoira',
          });
        }
      })

      this.ugoiraTool.apngGenerator.event.addListener("onStart", () => {
        vm.apngProgress = 0;
      });

      this.ugoiraTool.apngGenerator.event.addListener('onProgress', progress => {
        console.log(progress);
        vm.apngProgress = progress;
      });

      this.ugoiraTool.apngGenerator.event.addListener("onFinish", arrayBuffer => {
        vm.apngProgress = 1;
        vm.apngStatus = 2;

        let blob = new Blob([arrayBuffer], {type: 'image/apng'});
        vm.apngUrl = URL.createObjectURL(blob);

        if (thisApp.browserItems.ugoiraGenerateAndDownload) {
          vm.downloadFile(vm.apngUrl, vm.getFilename() + '.apng', {
            statType: 'ugoira',
          });
        }
      });
    })

    this.show = true

    browser.runtime.onConnect.addListener(this.handleConnect);
  },

  unmounted() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
  },

  beforeDestroy() {
    this.ugoiraTool.gifGenerator.event.removeEventListeners("onProgress")
    this.ugoiraTool.gifGenerator.event.removeEventListeners("onFinish")

    this.ugoiraTool.webMGenerator.event.removeEventListeners("onProgress")
    this.ugoiraTool.webMGenerator.event.removeEventListeners("onFinish")

    this.ugoiraTool.apngGenerator.event.removeEventListeners("onStart");
    this.ugoiraTool.apngGenerator.event.removeEventListeners("onFinish");
  },

  methods: {
    gifButtonClicked() {
      if (this.gifStatus === 2) {

        this.downloadFile(this.gifUrl, this.getFilename() + '.gif', {
          statType: 'ugoira',
        });
        return
      } else if (this.gifStatus !== 0) {
        return
      }

      this.gifStatus = 1

      this.ugoiraTool.gifGenerator.generate();
    },

    apngButtonClicked() {
      if (this.apngStatus === 2) {
        this.downloadFile(this.apngUrl, this.getFilename() + '.apng', {
          statType: 'ugoira',
        });
        return;
      } else if (this.apngStatus !== 0) {
        return;
      }

      this.apngStatus = 1;
      this.ugoiraTool.apngGenerator.generate();
    },

    webmButtonClicked() {
      if (this.webmStatus === 2) {
        this.downloadFile(this.webmUrl, this.getFilename() + '.webm', {
          statType: 'ugoira',
        });
        return
      } else if (this.webmStatus !== 0) {
        return
      }

      this.webmStatus = 1

      this.ugoiraTool.webMGenerator.generate()
    },

    getFilename() {
      return formatName(thisApp.browserItems.ugoiraRenameFormat, this.ugoiraTool.context, this.ugoiraTool.context.illustId)
    },

    isBrowser(browser) {
      var regex = new RegExp(browser, 'i');

      return regex.test(navigator.userAgent);
    },

    handleConnect(port) {
      let self = this;

      if (port.name === 'popup') {
        port.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === 'fetch-info') {
            port.postMessage({
              info: self.ugoiraTool.context
            })
          }
        })
      }
    }
  }
}
</script>
