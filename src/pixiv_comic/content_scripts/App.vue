<template>
  <control-panel id="__ptk-pixiv-comic-app" v-show="ready"
    :panelStyle="browserItems.downloadPanelStyle"
    :panelPosition="browserItems.downloadPanelPosition"
  >
    <ptk-button class="download-btn download-btn--min-70"
      @click="downloadImages"
    >{{ downloadText }}</ptk-button>
  </control-panel>
</template>

<script>
import Detector from '@/pixiv_comic/modules/Detector';
import Episode from '@/pixiv_comic/modules/Episode';
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin';
import Button from '@/content_scripts/components/Button';
import ControlPanel from '@/content_scripts/components/ControlPanel.vue';

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    'control-panel': ControlPanel,
    'ptk-button': Button
  },

  data() {
    return {
      ready: false,
      lastBlob: null,
      lastFilename: null,
      lastError: null,
      progress: 0,
      totalCount: 0,
      successCount: 0,
      failCount: 0,
      downloading: false,
      unsupportedPostType: false
    }
  },

  computed: {
    downloadText() {
      if (this.downloading) {
        return `${this.tl('_downloading')} ${this.downloadProgress}%`;
      } else {
        return this.isUnsupportedPostType ? this.tl('_unsupported') : this.tl('_download');
      }
    },

    downloadProgress() {
      let progress = Math.floor(this.progress * 10000) + '';
      let paddingZeroCount = 4 - progress.length;

      if (paddingZeroCount >= 0) {
        progress = '0'.repeat(4 - progress.length) + progress;
        return progress.substr(0, 2) + '.' + progress.substr(2);
      } else {
        return 100;
      }
    }
  },

  created() {
    /**
     * @type {Detector}
     */
    this.detector = Detector.getDefault();

    /**
     * @type {Object}
     */
    this.context = null;
  },

  mounted() {
    let observer = new MutationObserver((mutationsList, observer) => {
      /**
       * If different page has been loaded, app should re-reject the page
       */
      if (window.location.href !== this.currentUrl) {
        this.currentUrl = window.location.href;

        /**
         * Hide container
         */
        this.ready = false;
        this.lastError = null;
        this.lastBlob = null;
        this.lastData = null;
        this.progress = 0;
        this.lastFilename = null;
        this.downloading = false;
        this.totalCount = 0;
        this.successCount = 0;
        this.failCount = 0;

        this.injectPage();
      }
    });

    observer.observe(document.querySelector('body'), {
      attributes: true,
      childList: true,
      subtree: true
    });

    // this.injectPage();
  },

  methods: {
    injectPage() {
      try {
        let episodeAdapter = this.detector.getEpisodeAdapter(window.location.href);
        episodeAdapter.getContext().then(context => {
          if (context.pages.length > 0) {
            this.ready = true;
            this.isUnsupportedPostType = false;
            this.context = context;
          }
        });
      } catch (e) {
        if (e.name === 'UnsupportedPostType') {
          this.isUnsupportedPostType = true;
        } else {
          this.ready = false;
          console.error(e);
        }
      }
    },

    downloadImages() {
      let vm = this;

      /**
       * @type {Episode}
       */
      let episode = new Episode(this.context);

      let savePath = this.browserItems.illustrationRelativeLocation ?
            this.getSubfolder(this.browserItems.illustrationRelativeLocation, episode.context) :
            this.browserItems.downloadRelativeLocation;

      if (this.lastData) {
        this.downloadFile({
          src: this.lastData,
          filename: this.lastFilename,
          folder: savePath,
        });
      } else if (!this.downloading) {
        this.downloading = true;

        this.totalCount = episode.pagesNumber();

        episode.initOptions({
          splitSize: 99,
          illustrationRenameFormat: vm.getItem('illustrationRenameFormat'),
          illustrationImageRenameFormat: vm.getItem('illustrationImageRenameFormat'),
          pageNumberStartWithOne: vm.getItem('illustrationPageNumberStartWithOne'),
          illustrationPageNumberLength: 0,
        }).init();

        episode.addListener('download-progress', progress => {
          this.successCount = progress.successCount;
          this.failCount = progress.failCount;
          this.progress = progress.progress;
        });

        let indexes = [], pos = 0;

        while (pos < this.context.pages.length) {
          indexes.push(pos);
          pos++;
        }

        episode.downloadFiles({ indexes }, episode).then(files => {
          episode.getPackedFile({ files }).then(result => {
            this.lastData = result.data;
            this.lastFilename = result.filename;

            this.downloadFile({
              src: result.data,
              filename: result.filename,
              folder: savePath,
            });
          });
        }).finally(() => {
          this.downloading = false;
        });
      }

      console.log('download');
    },

    getItem(offset) {
      return this.browserItems[offset];
    },
  }
}
</script>

<style lang="scss">
#__ptk-pixiv-comic-app {

  .download-btn {
    min-width: 70px;
    text-align: center;
  }
}
</style>
