<template>
  <div v-if="show">
    <ptk-button
      :text="resourceDownloadText + (resourceSaved ? ' ✔️' : '')"
      @click="resourceButtonClicked"
      :type="resourceButtonType"
    ></ptk-button>
    <template v-if="resourceProgress === 100">
      <ptk-button
        :text="gifGenerateText + (gifSaved ? ' ✔️' : '')"
        @click="gifButtonClicked"
        :type="gifButtonType"
      ></ptk-button>
      <ptk-button
        :text="apngGenerateText + (apngSaved ? ' ✔️' : '')"
        @click="apngButtonClicked"
        :type="apngButtonType"
      ></ptk-button>
      <ptk-button
        :text="webGenerateText + (webmSaved ? ' ✔️' : '')"
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
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort'

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
      resourceSaved: false,

      gifProgress: null,
      gifStatus: 0,
      gifBlob: null,
      gifButtonType: '',
      gifSaved: false,

      apngProgress: null,
      apngStatus: 0,
      apngBlob: null,
      apngButtonType: '',
      apngSaved: false,

      webmProgress: null,
      webmStatus: 0,
      webmBlob: null,
      webmButtonType: '',
      webmSaved: false,

      forceDownload: false
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

    this.downloadRecordPort = DownloadRecordPort.getInstance();

    this.ugoiraTool.event.addExclusiveListener('onProgress', progress => {
      vm.resourceProgress = Math.round(progress * 100);
    });

    this.resourceProgress = 1;

    this.downloadRecordPort.port.onMessage.addListener(this.handleDownloadRecord);

    this.downloadRecordPort.getDownloadRecord({ id: this.ugoiraTool.getId(), type: DownloadRecordPort.illustType });

    this.initTool();

    this.show = true;

    browser.runtime.onConnect.addListener(this.handleConnect);
  },

  unmounted() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
    this.downloadRecordPort.port.onMessage.removeListener(this.handleDownloadRecord);
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
          vm.gifBlob = blob

          if (vm.browserItems.ugoiraGenerateAndDownload) {
            vm.gifButtonType = 'success';

            vm.downloadFile(vm.gifBlob, vm.getFilename() + '.gif', {
              folder: vm.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.ugoiraTool.context),
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
          vm.webmBlob = blob

          if (vm.browserItems.ugoiraGenerateAndDownload) {
            vm.webmButtonType = 'success';

            vm.downloadFile(vm.webmBlob, vm.getFilename() + '.webm', {
              folder: vm.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.ugoiraTool.context),
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
          vm.apngBlob = blob;

          if (vm.browserItems.ugoiraGenerateAndDownload) {
            vm.apngButtonType = 'success';

            vm.downloadFile(vm.apngBlob, vm.getFilename() + '.apng', {
              folder: vm.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.ugoiraTool.context),
              statType: 'ugoira',
            });
          }
        });
      }).catch(error => {
        vm.resourceProgress = -1;
        throw error;
      });
    },

    saveDownloadRecord(record) {
      this.downloadRecordPort.saveDownloadRecord({
        id: this.ugoiraTool.getId(),
        type: DownloadRecordPort.illustType,
        record
      });
    },

    allowDownload(isSaved) {
      if (isSaved && this.browserItems.askDownloadSavedWork && !this.forceDownload) {
        if (window.confirm(this.tl('_this_item_may_has_been_saved'))) {
          this.forceDownload = true;
        } else {
          return false;
        }
      }

      return true;
    },

    resourceButtonClicked() {
      if (!this.allowDownload(this.resourceSaved)) {
        return;
      }

      if (this.resourceProgress === -1) {
        this.initTool();
      } else if (this.tool.zipBlob) {
        this.resourceButtonType = 'success';

        this.downloadFile(this.tool.zipBlob, this.getFilename() + '.zip', {
          folder: this.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.ugoiraTool.context),
          statType: 'ugoira',
        });

        this.saveDownloadRecord({
          zip: 1
        });

        this.resourceSaved = true;
      }
    },

    gifButtonClicked() {
      if (!this.allowDownload(this.gifSaved)) {
        return;
      }

      if (this.gifStatus === 2) {
        this.gifButtonType = 'success';

        this.downloadFile(this.gifBlob, this.getFilename() + '.gif', {
          folder: this.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.ugoiraTool.context),
          statType: 'ugoira',
        });

        this.saveDownloadRecord({
          gif: 1
        });

        this.gifSaved = true;

        return
      } else if (this.gifStatus !== 0) {
        return
      }

      this.gifStatus = 1

      this.ugoiraTool.gifGenerator.generate();
    },

    apngButtonClicked() {
      if (!this.allowDownload(this.apngSaved)) {
        return;
      }

      if (this.apngStatus === 2) {
        this.apngButtonType = 'success';

        this.downloadFile(this.apngBlob, this.getFilename() + '.apng', {
          folder: this.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.ugoiraTool.context),
          statType: 'ugoira',
        });

        this.saveDownloadRecord({
          apng: 1
        });

        this.apngSaved = true;

        return;
      } else if (this.apngStatus !== 0) {
        return;
      }

      this.apngStatus = 1;
      this.ugoiraTool.apngGenerator.generate();
    },

    webmButtonClicked() {
      if (!this.allowDownload(this.webmSaved)) {
        return;
      }

      if (this.webmStatus === 2) {
        this.webmButtonType = 'success';

        this.downloadFile(this.webmBlob, this.getFilename() + '.webm', {
          folder: this.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.ugoiraTool.context),
          statType: 'ugoira',
        });

        this.saveDownloadRecord({
          webm: 1
        });

        this.webmSaved = true;

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

    handleDownloadRecord(message, port) {
      if (message.channel === DownloadRecordPort.portName + ':get-download-record' && message.error === undefined) {
        if (message.data.zip === 1) this.resourceSaved = true;
        if (message.data.gif === 1) this.gifSaved = true;
        if (message.data.apng === 1) this.apngSaved = true;
        if (message.data.webm === 1) this.webmSaved = true;
      }
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
