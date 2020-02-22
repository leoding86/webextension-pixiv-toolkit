<template>
  <div v-if="show">
    <ptk-button
      @click="downloadNovel"
      :type="downloadNovelType"
    >Download Novel{{ isSaved ? ' ✔️' : '' }}</ptk-button>
  </div>
</template>

<script>
import Button from "@/content_scripts/components/Button";
import formatName from "@/modules/Util/formatName";
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin';
import DownloadManager from '@/modules/Manager/DownloadManager';

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
      show: false,
      fileUrl: null,
      downloadNovelType: '',
      isSaved: false,
      forceDownload: false
    };
  },

  mounted() {
    let vm = this;

    DownloadManager.getRecord(this.tool.getId(), DownloadManager.novelType).then(doc => {
      this.isSaved = true;
    }).finally(() => {
      this.tool.prepareProps();

      if (this.browserItems.novelIncludeDescription) {
        this.tool.includeDescription();
      }

      this.tool.prepareSections();

      this.tool.generateNovel().then(url => {
        this.show = true;
        this.fileUrl = url;
      });

      browser.runtime.onConnect.addListener(this.handleConnect);
    });
  },

  unmounted() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
  },

  methods: {
    saveDownloadRecord(record) {
      this.isSaved = true;

      DownloadManager.saveRecord(this.tool.getId(), DownloadManager.novelType, record);
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

    downloadNovel() {
      if (!this.allowDownload(this.isSaved)) {
        return;
      }

      let filename = formatName(
        this.browserItems.novelRenameFormat,
        this.tool.context,
        this.tool.context.novelId + "_" + this.tool.context.novelTitle
      );

      this.downloadNovelType = 'success';

      this.downloadFile(this.fileUrl, filename + '.epub', {
        statType: 'novel'
      });

      this.saveDownloadRecord({ novel: 1 });

      this.isSaved = true;
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
