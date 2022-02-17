<template>
  <div class="ptk__tool">
    <ptk-button
      :type="zipButton.type"
      @click="zipButtonClickHandle"
    >{{ zipButton.text + (zipButton.saved ? ' ✔️' : '') }}</ptk-button>
    <template v-if="ready">
      <ptk-button
        v-for="(button, type) in generatorButtons"
        :key="type"
        @click="generateButtonClickHandle(type)"
      >{{ button.text + (button.saved ? ' ✔️' : '') }}</ptk-button>
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
      zipButton: {
        type: '',
        saved: false,
        blob: null,
        text: this.tl('_preparing')
      },

      ready: false,

      generatorButtons: {
        gif: {},

        apng: {},

        webm: {}
      },

      isGenerating: false,

      forceDownload: false
    }
  },

  beforeMount() {
    /**
     * Inital generator buttons props
     */
    Object.keys(this.generatorButtons).forEach(type => {
      this.$set(this.generatorButtons, type, {
        type: '',
        extName: '',
        blob: null,

        /**
         * 0: not start
         * 1: generated
         * 2: generating
         * 4: generate failed
         */
        status: 0,
        saved: false,
        text: `${this.tl('_generate')} ${type.toUpperCase()}`
      });
    });

    if (this.browserItems.ugoiraCustomFFmpegCommand) {
      this.$set(this.generatorButtons, 'custom', {
        type: '',
        extName: '',
        blob: null,
        status: 0,
        saved: false,
        text: `${this.tl('_generate')} ${this.tl('_custom').toUpperCase()}`
      });
    }

    /**
     * Add listener to download resource progress event
     */
    this.tool.addExclusiveListener('progress', progress => {
      this.zipButton.text = `${this.tl('_downloading')} ${Math.round(progress * 100)}%`;
    });

    this.downloadRecordPort = DownloadRecordPort.getInstance();
    this.downloadRecordPort.port.onMessage.addListener(this.handleDownloadRecord);
    this.downloadRecordPort.getDownloadRecord({ id: this.tool.getId(), type: DownloadRecordPort.illustType });

    this.initTool().then(() => {
      this.ready = true;
      browser.runtime.onConnect.addListener(this.handleConnect);
    });
  },

  /**
   * In unmounted method remove the listeners that need to be removed
   */
  beforeDestroy() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
    this.downloadRecordPort.port.onMessage.removeListener(this.handleDownloadRecord);
  },

  methods: {
    /**
     * @returns {Promise}
     */
    initTool() {
      /**
       * Init ugoira tool will reset the generators instance, so feel free to add listeners to gererators again
       */
      return this.tool.init().then(() => {
        this.zipButton.text = this.tl('_save') + ' ZIP';
      }).catch(error => {
        console.error(error);
        this.zipButton.text = this.tl('_interrupted_click_to_retry')
      });
    },

    saveDownloadRecord(record) {
      this.downloadRecordPort.saveDownloadRecord({
        id: this.tool.getId(),
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
        if (window.confirm(this.tl('_this_item_may_has_been_saved'))) {
          this.forceDownload = true;
        } else {
          return false;
        }
      }

      return true;
    },

    getSavePath() {
      return this.browserItems.ugoiraRelativeLocation ?
        this.getSubfolder(this.browserItems.ugoiraRelativeLocation, this.tool.context) :
        this.browserItems.downloadRelativeLocation;
    },

    zipButtonClickHandle() {
      if (!this.allowDownload(this.zipButton.saved)) {
        return;
      }

      if (this.zipButton.saved === -1) {
        this.initTool();
      } else if (this.tool.isReady()) {
        this.zipButton.type = 'success';

        let savePath = this.getSavePath();

        this.downloadFile({
          src: this.tool.zipBlob,
          filename: this.getFilename() + '.zip',
          folder: savePath,
        })
        .then(() => this.updateDownloadStat('ugoira'));

        this.saveDownloadRecord({
          zip: 1
        });

        this.zipButton.saved = true;
      }
    },

    saveFile(button, blob, type) {
      let savePath = this.getSavePath();

      this.downloadFile({
        src: blob,
        filename: this.getFilename() + '.' + button.extName,
        folder: savePath,
      })
      .then(() => this.updateDownloadStat('ugoira'));

      let data = {};
      data[type] = 1;

      this.saveDownloadRecord(data);
    },

    generateButtonClickHandle(type) {
      /**
       * This is a reference of the one generator button of the component's generatorButtons prop
       */
      let button = this.generatorButtons[type];

      if (button.status === 0 || button.status === 4) {
        if (this.browserItems.ugoiraConvertTool === 'ffmpeg' && this.isGenerating) {
          alert('Please waiting another generation task done');
          return;
        }

        this.isGenerating = true;

        /**
         * Create the generator with the type argument
         */
        // let generator = this.tool.makeGenerator(type);
        this.tool.getGenerator(type, type === 'custom' ? this.browserItems.ugoiraCustomFFmpegCommand : this.browserItems.ugoiraConvertTool).then(generator => {
          // if (this.browserItems.enableExtend) {
          //   if (this.tool.context.illustDuration < this.browserItems.enableWhenUnderSeconds * 1000) {
          //     generator.setRepeat(Math.floor(this.browserItems.extendDuration * 1000 / this.tool.context.illustDuration) + 1);
          //   }
          // }

          generator.addListener('data', (totalFrames, loadedFrames) => {
            /**
             * Update the generator button status
             */
            button.status = 2;
            button.text = `${this.tl('_preparing')} ${Math.floor(loadedFrames / totalFrames * 100)}%`;
          });

          /**
           * Add the listener to the generator's generating progress event
           */
          generator.addListener('progress', progress => {
            // update text
            button.text = `${this.tl('_generating')} ${Math.round(progress * 100)}%`;
          });

          /**
           * Add the listener to the generator's finish event
           */
          generator.addListener('finish', (blob, ext) => {
            /**
             * Update status, text and style type
             */
            button.status = 1;
            button.text = this.tl('_save') + ' ' + type.toUpperCase();
            button.type = 'success';
            button.extName = ext ? ext : type;
            button.blob = blob;
            button.saved = 1;

            this.saveFile(button, blob, type);

            this.isGenerating = false;
          });

          generator.generate().then(() => {
            //
          }).catch(error => {
            console.error(error);
          }).finally(() => {
            this.isGenerating = false;
          });
        });
      } else if (button.status === 1) {
        this.saveFile(button, button.blob, type);
      } else if (button.status === 2) {
        alert(this.tl('_generating_please_wait'));
      }
    },

    getFilename() {
      return formatName(this.browserItems.ugoiraRenameFormat, this.tool.context, this.tool.context.illustId)
    },

    isBrowser(browser) {
      var regex = new RegExp(browser, 'i');

      return regex.test(navigator.userAgent);
    },

    handleDownloadRecord(message, port) {
      if (message.channel === DownloadRecordPort.portName + ':get-download-record' && message.error === undefined) {
        if (message.data.zip === 1) this.zipButton.saved = true;
        if (message.data.gif === 1) this.generatorButtons.gif.saved = true;
        if (message.data.apng === 1) this.generatorButtons.apng.saved = true;
        if (message.data.webm === 1) this.generatorButtons.webm.saved = true;
      }
    },

    handleConnect(port) {
      let self = this;

      if (port.name === 'popup') {
        port.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === 'fetch-info') {
            port.postMessage({
              info: self.tool.context
            })
          }
        })
      }
    }
  }
}
</script>
