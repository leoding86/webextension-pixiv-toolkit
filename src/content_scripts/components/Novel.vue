<template>
  <div v-if="show">
    <ptk-button @click="downloadNovel">Download Novel</ptk-button>
  </div>
</template>

<script>
import Button from "@/content_scripts/components/Button";
import formatName from "@/modules/Util/formatName";
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin';

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
      novelTool: null,
      show: false,
      fileUrl: null
    };
  },

  mounted() {
    let vm = this;

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
  },

  unmounted() {
    browser.runtime.onConnect.removeListener(this.handleConnect)
  },

  methods: {
    downloadNovel() {
      let filename = formatName(
        this.browserItems.novelRenameFormat,
        this.tool.context,
        this.tool.context.novelId + "_" + this.tool.context.novelTitle
      );

      this.downloadFile(this.fileUrl, filename + '.epub', {
        statType: 'novel'
      });
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
