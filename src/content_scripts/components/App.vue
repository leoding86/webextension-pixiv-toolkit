<template>
  <div :class="{'ptk__container': true}" v-if="showApp">
    <div :class="{'ptk__handler': true, 'ptk__handler--active': showContainer}"
      @click="handlerClickHandle"
    >P*</div>

    <subscription-button class="ptk__handler"
      style="right:180px;"
      v-if="showSubscribe"
      :user-id="userId"></subscription-button>

    <div class="ptk__container__body"
      :class="{'ptk__container__body--show': showContainer}">
      <div class="ptk__container__body-container"
        :class="{'ptk__container__body-container--show': showContainer}">
        <ugoira-tool v-if="isUgoira" :tool="tool" class="ptk-tool__component">ugoira</ugoira-tool>
        <manga-tool v-else-if="isManga" :tool="tool" class="ptk-tool__component">manga</manga-tool>
        <illust-tool v-else-if="isIllust" :tool="tool" class="ptk-tool__component">illust</illust-tool>
        <novel-tool v-else-if="isNovel" :tool="tool" class="ptk-tool__component">novel</novel-tool>
        <ptk-button v-else text="Unsupported page"></ptk-button>
      </div>
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
import Button from '@/content_scripts/components/Button'

export default {
  components: {
    "novel-tool": Novel,
    'manga-tool': Manga,
    'illust-tool': Illust,
    'ugoira-tool': Ugoira,
    'subscription-button': SubscriptionButton,
    'ptk-button': Button
  },

  data() {
    return {
      pageType: null,
      currentUrl: null,
      tool: null,
      containerShowed: false,
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
      return false;
    },

    showContainer() {
      return this.containerShowed
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
    let vm = this;

    let observer = new MutationObserver((mutationsList, observer) => {
      /**
       * If different page has been loaded, app should re-reject the page
       */
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
            if (!vm.browserItems.featureKnown) {
              vm.containerShowed = true

              window.setTimeout(() => {
                vm.containerShowed = false
              }, 1000)
            }
          }, 200);

          vm.tool = tool;
          vm.pageType = vm.detector.currentType;

          // show container
          vm.containerShowed = vm.browserItems.autoActivateDownloadPanel;

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

<style lang="scss">
.ptk__container {
  position: fixed;
  width: 100%;
  height: 40px;
  bottom: -40px;
  overflow: visible;
  // background: url(../assets/app-bg.png) repeat-x;
  z-index: 99999;

  .ptk__container__body {
    position: absolute;
    overflow: visible;
    display: inline-block;
    right: 50%;
    transition: all 0.5s;

    .ptk__container__body-container {
      display: inline-block;
      position: relative;
      top: 0;
      left: 50%;
      padding: 8px 12px;
      background: #fff;
      border-radius: 30px;
      box-shadow: 0 0 8px rgba(0,0,0,0.3);
      overflow: hidden;
      transition: all 0.5s;

      .button {
        &:last-child {
          margin-right: 0;
        }
      }
    }

    .ptk__container__body-container--show {
      top: -50px;
    }
  }

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
    transition: all 0.5s;
  }

  .ptk__handler--active {
    box-shadow: 0px -2px 5px rgba(0,0,0,0.3);
  }

  .ptk-tool__component {
    display: inline-block;
  }
}
</style>
