<template>
  <div :class="{'ptk__container': true, 'ptk__container--show': showContainer}" v-if="showApp">
    <div :class="{'ptk__handler': true, 'ptk__handler--active': showContainer}"
      @click="handlerClickHandle"
    >P*</div>

    <subscription-button class="ptk__handler"
      style="right:180px;"
      v-if="showSubscribe"
      :user-id="userId"></subscription-button>

    <ugoira-tool v-if="isUgoira" :tool="tool">ugoira</ugoira-tool>
    <manga-tool v-else-if="isManga" :tool="tool">manga</manga-tool>
    <illust-tool v-else-if="isIllust" :tool="tool">illust</illust-tool>
    <novel-tool v-else-if="isNovel" :tool="tool">novel</novel-tool>
    <div v-else>
      <p>Unsupported page</p>
    </div>
  </div>
</template>

<script>
import Detector from "@/content_scripts/Detector"
import Novel from "@/content_scripts/components/Novel"
import Manga from '@/content_scripts/components/Manga'
import Illust from '@/content_scripts/components/Illust'
import Ugoira from '@/content_scripts/components/Ugoira'
import SubscriptionButton from '@/content_scripts/components/sub/SubscriptionButton'
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort'

export default {
  components: {
    "novel-tool": Novel,
    'manga-tool': Manga,
    'illust-tool': Illust,
    'ugoira-tool': Ugoira,
    'subscription-button': SubscriptionButton
  },

  data() {
    return {
      pageType: null,
      currentUrl: null,
      tool: null,
      containerShowed: false,
      browserItems: {}
    };
  },

  computed: {
    showApp() {
      return this.pageType !== null;
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
    },

    showSubscribe() {
      return (this.pageType === Detector.UGOIRA_TYPE || this.pageType === Detector.MANGA_TYPE || this.pageType === Detector.ILLUST_TYPE) && this.$root.plusVersion
    },

    showContainer() {
      // console.log(this.browserItems)
      return this.browserItems.autoActivateDownloadPanel || this.containerShowed
    },

    userId() {
      if (this.tool) {
        return parseInt(this.tool.getUserId())
      }

      return 0
    }
  },

  beforeMount() {
    this.illustHistoryPort = IllustHistoryPort.getInstance();
    this.detector = new Detector();
  },

  mounted() {
    let vm = window.thisApp = this;

    browser.storage.onChanged.addListener((changes, namespace) => {
      for (let key in changes) {
        vm.browserItems[key] = changes[key].newValue;
      }
    });

    browser.storage.local.get(null, items => {
      vm.browserItems = items;

      let observer = new MutationObserver((mutationsList, observer) => {
        if (window.location.href !== vm.currentUrl) {
          vm.currentUrl = window.location.href;

          // hide container
          vm.containerShowed = false;

          // set pageType to null for mounting tool component
          vm.pageType = null;

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
    });
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
          window.setTimeout(() => {
            if (!thisApp.browserItems.featureKnown) {
              vm.containerShowed = true

              window.setTimeout(() => {
                vm.containerShowed = false
              }, 1000)
            }
          }, 200);

          if (!vm.browserItems.enableSaveVisitHistory) {
            return;
          }

          if (tool.isR() && vm.browserItems.notSaveNSFWWorkInHistory) {
            return;
          }

          vm.tool = tool;
          vm.pageType = vm.detector.currentType;

          // check page type to determine save history
          if (vm.isUgoira || vm.isManga || vm.isIllust) {
            vm.illustHistoryPort.saveIllustHistory({
              id: vm.tool.getId(),
              title: vm.tool.getTitle(),
              images: vm.tool.getImages(),
              type: vm.pageType,
              viewed_at: Math.round(Date.now() / 1000),
              r: vm.tool.isR()
            });
          }
        })
        .catch(e => {
          return;
        });
    },

    handlerClickHandle() {
      this.containerShowed = !this.containerShowed

      browser.storage.local.set({
        featureKnown: true
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.ptk__container {
  position: fixed;
  width: 100%;
  height: 40px;
  bottom: -40px;
  overflow: visible;
  z-index: 99999;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s;

  .ptk__handler {
    position: absolute;
    top: -22px;
    right: 135px;
    z-index: 99999;
    padding: 0 11px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    background: #0096fa;
    box-shadow: 0px -1px 5px rgba(0,0,0,0.2);
    color: #fff;
    cursor: pointer;
    line-height: 22px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    transition: all 0.3s;
  }

  .ptk__handler--active {
    box-shadow: 0px -2px 5px rgba(0,0,0,0.3);
  }
}

.ptk__container--show {
  bottom: 0;
  box-shadow: 0 1px 10px rgba(0,0,0,0.5);
}
</style>
