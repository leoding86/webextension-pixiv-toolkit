<template>
  <div v-if="show">
    <ptk-button
      :text="resourceDownloadText"
      @click="resourceButtonClicked"
      :type="resourceButtonType"
    ></ptk-button>
    <template v-if="resourceProgress === 100">
      <ptk-button
        :text="gifGenerateText"
        @click="gifButtonClicked"
        :type="gifButtonType"
      ></ptk-button>
      <ptk-button
        :text="apngGenerateText"
        @click="apngButtonClicked"
        :type="apngButtonType"
      ></ptk-button>
      <ptk-button
        :text="webGenerateText"
        @click="webmButtonClicked"
        :type="webmButtonType"
        v-if="!isBrowser('firefox')"
      ></ptk-button>
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
import Browser from '@/modules/Browser/Browser'
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
      resourceButtonType: '',

      gifProgress: null,
      gifStatus: 0,
      gifUrl: null,
      gifButtonType: '',

      apngProgress: null,
      apngStatus: 0,
      apngUrl: null,
      apngButtonType: '',

      webmProgress: null,
      webmStatus: 0,
      webmUrl: null,
      webmButtonType: ''
    }
  },

  computed: {
    resourceDownloadText() {
      return this.resourceProgress === -1 ?
        "Interrupted, Click to retry" :
        this.resourceProgress === 0 ?
          "Preparing" :
          this.resourceProgress === 100 ?
            "Download Zip" :
            this.browserItems.ugoiraDisplayDownloadProgress ?
              "Downloading" + ` ${this.resourceProgress}%` :
              "Downloading"
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

    this.ugoiraTool.event.addExclusiveListener('onProgress', progress => {
      vm.resourceProgress = Math.round(progress * 100);
    });

    this.resourceProgress = 1;

    this.initTool();

    this.show = true

    browser.runtime.onConnect.addListener(this.handleConnect);
  },

  unmounted() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
  },

  beforeDestroy() {
    /**
     * Check whether the tool is initialization before remove the related listeners,
     * because when user navigate to other page before the page loaded will cause the tool
     * has no time to complete initialization.
     */
    if (this.ugoiraTool) {
      this.ugoiraTool.gifGenerator.event.removeEventListeners("onProgress")
      this.ugoiraTool.gifGenerator.event.removeEventListeners("onFinish")

      this.ugoiraTool.webMGenerator.event.removeEventListeners("onProgress")
      this.ugoiraTool.webMGenerator.event.removeEventListeners("onFinish")

      this.ugoiraTool.apngGenerator.event.removeEventListeners("onStart");
      this.ugoiraTool.apngGenerator.event.removeEventListeners("onFinish");
    }
  },

  methods: {
    initTool() {
      if (this.browserItems.ugoiraDisplayDownloadProgress) {
        this.ugoiraTool.enableDisplayDownloadProgress();
      }

      let vm = this;

      this.resourceProgress = 1;

      /**
       * Init ugoira tool will reset the generators instance, so feel free and must to add listeners to gererators again
       */
      this.ugoiraTool.init().then(blob => {
        vm.resourceProgress = 100;

        this.ugoiraTool.gifGenerator.event.addListener("onProgress", progress => {
          vm.gifProgress = progress
        })

        this.ugoiraTool.gifGenerator.event.addListener("onFinish", blob => {
          vm.gifProgress = 1
          vm.gifStatus = 2
          vm.gifUrl = URL.createObjectURL(blob)

          if (vm.browserItems.ugoiraGenerateAndDownload) {
            vm.gifButtonType = 'success';

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

          if (vm.browserItems.ugoiraGenerateAndDownload) {
            vm.webmButtonType = 'success';

            vm.downloadFile(vm.webmUrl, vm.getFilename() + '.webm', {
              statType: 'ugoira',
            });
          }
        })

        this.ugoiraTool.apngGenerator.event.addListener("onStart", () => {
          vm.apngProgress = 0;
        });

        this.ugoiraTool.apngGenerator.event.addListener('onProgress', progress => {
          vm.apngProgress = progress;
        });

        this.ugoiraTool.apngGenerator.event.addListener("onFinish", arrayBuffer => {
          vm.apngProgress = 1;
          vm.apngStatus = 2;

          let blob = new Blob([arrayBuffer], {type: 'image/apng'});
          vm.apngUrl = URL.createObjectURL(blob);

          if (vm.browserItems.ugoiraGenerateAndDownload) {
            vm.apngButtonType = 'success';

            vm.downloadFile(vm.apngUrl, vm.getFilename() + '.apng', {
              statType: 'ugoira',
            });
          }
        });
      }).catch(error => {
        vm.resourceProgress = -1;
        throw error;
      });
    },

    resourceButtonClicked() {
      if (this.resourceProgress === -1) {
        this.initTool();
      } else if (this.tool.zipBlob) {
        this.resourceButtonType = 'success';

        this.downloadFile(URL.createObjectURL(this.tool.zipBlob), this.getFilename() + '.zip', {
          statType: 'ugoira',
        });
      }
    },

    gifButtonClicked() {
      if (this.gifStatus === 2) {
        this.gifButtonType = 'success';

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
        this.apngButtonType = 'success';

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
        this.webmButtonType = 'success';

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
      return formatName(this.browserItems.ugoiraRenameFormat, this.ugoiraTool.context, this.ugoiraTool.context.illustId)
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
