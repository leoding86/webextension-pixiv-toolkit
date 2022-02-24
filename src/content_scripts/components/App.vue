<template>
  <control-panel v-if="showApp" :lastError="lastError"
    :panelStyle="browserItems.downloadPanelStyle"
    :panelPosition="browserItems.downloadPanelPosition"
  >
    <ugoira-tool v-if="isUgoira" :tool="tool">ugoira</ugoira-tool>
    <manga-tool v-else-if="isManga" :tool="tool">manga</manga-tool>
    <illust-tool v-else-if="isIllust" :tool="tool">illust</illust-tool>
    <novel-tool v-else-if="isNovel" :tool="tool">novel</novel-tool>
    <ptk-button v-else-if="isUndetermined" text="Parsing information"></ptk-button>
    <ptk-button v-if="!isUndetermined && browserItems.showPixivOmina"
      class="ptk__pixiv-omina__btn"
      @click="passToPixivOmina"
    >Pixiv Omina</ptk-button>
  </control-panel>
</template>

<script>
import ControlPanel from '@/content_scripts/components/ControlPanel.vue';
import Detector from "@/content_scripts/Detector"
import Novel from "@/content_scripts/components/Novel"
import Manga from '@/content_scripts/components/Manga'
import Illust from '@/content_scripts/components/Illust'
import Ugoira from '@/content_scripts/components/Ugoira'
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort/RendererPort'
import Button from '@/content_scripts/components/Button'

export default {
  components: {
    'control-panel': ControlPanel,
    "novel-tool": Novel,
    'manga-tool': Manga,
    'illust-tool': Illust,
    'ugoira-tool': Ugoira,
    'ptk-button': Button
  },

  data() {
    return {
      pageType: Detector.UNDETERMINED_TYPE,
      currentUrl: null,
      tool: null,
      lastError: null,
      isDark: false,
    };
  },

  computed: {
    showApp() {
      return this.pageType !== Detector.UNSUPPORTED_TYPE;
    },

    isUndetermined() {
      return Detector.UNDETERMINED_TYPE === this.pageType
    },

    isUgoira() {
      return Detector.UGOIRA_TYPE === this.pageType;
    },

    isManga() {
      return Detector.MANGA_TYPE === this.pageType;
    },

    isIllust() {
      return Detector.ILLUST_TYPE === this.pageType;
    },

    isNovel() {
      return Detector.NOVEL_TYPE === this.pageType;
    }
  },

  created() {
    this.illustHistoryPort = IllustHistoryPort.getInstance();
    this.detector = new Detector();
  },

  mounted() {
    let vm = this;

    let observer = new MutationObserver((mutationsList, observer) => {
      /**
       * If different page has been loaded, app should re-reject the page
       */
      if (window.location.href !== vm.currentUrl) {
        vm.currentUrl = window.location.href;

        // set pageType to null for mounting tool component
        vm.pageType = Detector.UNDETERMINED_TYPE;

        vm.lastError = null;

        vm.injectPage();
      }
    });

    observer.observe(document.querySelector('body'), {
      attributes: true,
      childList: true,
      subtree: true
    });

    this.currentUrl = window.location.href;

    this.injectPage();
  },

  methods: {
    injectPage() {
      let vm = this;

      this.detector
        .init(this.currentUrl)
        .then(() => {
          return vm.detector.injectPage();
        })
        .then(tool => {
          vm.tool = tool;
          vm.pageType = vm.detector.currentType;

          if (!vm.browserItems.enableSaveVisitHistory) {
            return;
          }

          if (tool.isR() && vm.browserItems.notSaveNSFWWorkInHistory) {
            return;
          }

          // check page type to determine save history
          if (vm.isUgoira || vm.isManga || vm.isIllust) {
            vm.illustHistoryPort.saveIllustHistory({
              id: vm.tool.getId(),
              title: vm.tool.getTitle(),
              images: vm.tool.getImages(),
              type: vm.pageType,
              userId: vm.tool.getUserId(),
              userName: vm.tool.getUserName(),
              viewed_at: Math.round(Date.now() / 1000),
              r: vm.tool.isR()
            });
          } else if (vm.isNovel) {
            vm.illustHistoryPort.saveIllustHistory({
              id: 'N' + vm.tool.getId(),
              title: vm.tool.getTitle(),
              image: vm.tool.getCover(),
              isNovel: true,
              userId: vm.tool.getId(),
              userName: vm.tool.getUserName(),
              viewed_at: Math.round(Date.now() / 1000),
              r: vm.tool.isR()
            });
          }
        })
        .catch(e => {
          console.log(e);
          if (typeof e === 'string') {
            this.lastError = e;
          } else if (e instanceof Error) {
            if (e.name === 'InvalidPageError') {
              this.pageType = Detector.UNSUPPORTED_TYPE;
            }

            this.lastError = e.message;
          }
        });
    },

    disableGuide() {
      browser.storage.local.set({
        guideShowed: true
      });
    },

    passToPixivOmina() {
      window.location.assign(`pixiv-omina://create-download?url=${encodeURIComponent(window.location.href)}`);
    }
  }
}
</script>

<style lang="scss">
.ptk__pixiv-omina__btn {
  margin-left: 5px;
}
</style>
