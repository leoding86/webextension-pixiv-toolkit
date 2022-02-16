<template>
  <div class="ptk__tool" v-if="show">
    <ptk-button
      v-for="(button, i) in buttons"
      :key="i"
      :type="button.download ? 'success' : ''"
      @click="button.clickHandle(button)"
    >{{ button.text }} {{ button.saved ? ' ✔️' : '' }}</ptk-button>
  </div>
</template>

<script>
import Button from "@/content_scripts/components/Button";
import formatName from "@/modules/Util/formatName";
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin';
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort';

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
    let vm = this;

    return {
      show: false,
      downloadNovelType: '',
      isSaved: false,
      forceDownload: false,

      buttons: [
        {
          type: 'epub',
          text: this.tl('_save') + ' Epub',
          saved: '',
          download: false,
          blob: null,
          clickHandle: button => {
            vm.downloadNovel('epub', button);
          }
        }, {
          type: 'txt',
          text: this.tl('_save') + ' Txt',
          saved: '',
          download: false,
          blob: null,
          clickHandle: button => {
            vm.downloadNovel('txt', button);
          }
        }
      ]
    };
  },

  mounted() {
    /**
     * @var {DownloadRecordPort}
     */
    this.downloadRecordPort = DownloadRecordPort.getInstance();

    this.downloadRecordPort.port.onMessage.addListener(this.handleDownloadRecord);

    this.downloadRecordPort.getDownloadRecord({ id: this.tool.getId(), type: DownloadRecordPort.novelType });

    browser.runtime.onConnect.addListener(this.handleConnect);

    this.show = true;
  },

  beforeDestroy() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
    this.downloadRecordPort.port.onMessage.removeListener(this.handleDownloadRecord);
  },

  methods: {
    saveDownloadRecord(record) {
      this.downloadRecordPort.saveDownloadRecord({
        id: this.tool.getId(),
        type: DownloadRecordPort.novelType,
        record: Object.assign({
          title: this.tool.getTitle(),
          userId: this.tool.getUserId(),
          userName: this.tool.getUserName(),
          thumb: this.tool.getCover(),
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

    updateButton(button, data) {
      this.$set(
        this.buttons,
        this.buttons.indexOf(button),
        Object.assign(button, data)
      );
    },

    getFilename(type) {
      return formatName(
        this.tool.inSeries() ? this.browserItems.novelRenameFormat
                             : this.browserItems.novelRenameFormat.replace(/#.*#/, ''),
        this.tool.context,
        this.tool.context.novelId + "_" + this.tool.context.novelTitle
      ) + '.' + type;
    },

    downloadNovel(type, button) {
      if (!this.allowDownload(button.saved)) {
        return;
      }

      let novelGenerator = this.tool.getGenerator(type);

      novelGenerator.addMeta('uuid', this.tool.context.novelUrl)
        .addMeta('author', this.tool.context.userName)
        .addMeta('attributionUrl', this.tool.context.novelUrl)
        .addMeta('cover', this.tool.context.novelCover)
        .addMeta('title', this.tool.context.novelTitle);

      if (this.browserItems.novelIncludeDescription) {
        novelGenerator.appendSection(this.tool.context.novelDescription);
      }

      this.tool.context.novelSections.forEach(section => {
        novelGenerator.appendSection(section);
      });

      novelGenerator.makeBook().then(blob => {
        this.updateButton(button, {
          blob: blob,
          saved: true,
          download: true
        });

        let savePath = this.browserItems.novelRelativeLocation ?
          this.getSubfolder(this.browserItems.novelRelativeLocation, this.tool.context) :
          this.browserItems.downloadRelativeLocation;

        this.downloadFile({
          src: blob,
          filename: this.getFilename(type),
          folder: savePath,
        })
        .then(() => this.updateDownloadStat('novel'));

        let record = {};

        record[type] = 1;

        this.saveDownloadRecord(record);
      });
    },

    handleDownloadRecord(message, port) {
      if (message.channel === DownloadRecordPort.portName + ':get-download-record' && message.error === undefined) {
        this.buttons.forEach(button => {
          if (message.data && message.data[button.type] === 1) {
            this.updateButton(button, { saved: true });
          }
        });
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
};
</script>
