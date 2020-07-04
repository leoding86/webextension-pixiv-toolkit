<template>
  <div id="__ptk-fanbox-app" v-show="ready">
    <ptk-button class="download-btn"
      @click="downloadImages"
    >{{ downloadText }}</ptk-button>
  </div>
</template>

<script>
import Detector from '@/fanbox/modules/Detector';
import Post from '@/fanbox/modules/Post';
import downloadFileMixin from '@/content_scripts/mixins/downloadFileMixin';
import Button from '@/content_scripts/components/Button';

export default {
  mixins: [
    downloadFileMixin
  ],

  components: {
    'ptk-button': Button
  },

  data() {
    return {
      ready: false,
      lastBlob: null,
      lastFilename: null,
      lastError: null,
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
        return `T: ${this.totalCount} / S: ${this.successCount} / F: ${this.failCount}`;
      } else {
        return this.isUnsupportedPostType ? 'Unsupported' : 'Download';
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
        let postAdatper = this.detector.getPostAdapter(window.location.href);
        postAdatper.getContext().then(context => {
          if (context.images.length > 0) {
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

      if (this.lastBlob) {
        this.downloadFile(this.lastBlob, this.lastFilename, {
          folder: this.getSubfolder(vm.getItem('illustrationRelativeLocation'), post.context),
        });
      } else if (!this.downloading) {
        this.downloading = true;

        /**
         * @type {Post}
         */
        let post = new Post(this.context);

        this.totalCount = post.pagesNumber();

        post.initOptions({
          splitSize: 99,
          illustrationRenameFormat: vm.getItem('illustrationRenameFormat'),
          illustrationImageRenameFormat: vm.getItem('illustrationImageRenameFormat'),
          pageNumberStartWithOne: vm.getItem('illustrationPageNumberStartWithOne')
        }).init();

        post.addListener('download-progress', progress => {
          this.successCount = progress.successCount;
          this.failCount = progress.failCount;
        });

        post.addListener('download-finish', ({ blob, filename }) => {
          this.lastBlob = blob;
          this.lastFilename = filename;
          this.downloading = false;

          this.downloadFile(blob, filename, {
            folder: this.getSubfolder(vm.getItem('illustrationRelativeLocation'), post.context),
          });
        });

        post.downloadChunk();
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
#__ptk-fanbox-app {

  .download-btn {
    position: fixed;
    left: 10px;
    bottom: 10px;
  }
}
</style>
