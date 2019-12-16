<template>
  <div :class="{'ptk__container': true}">
    <div :class="{'ptk__handler': true, 'ptk__handler--active': showContainer, 'ptk__handler--error': hasError}"
      @click="handlerClickHandle"
    >P*</div>

    <subscription-button class="ptk__handler"
      style="right:180px;"
      v-if="showSubscribe"
      :user-id="userId"
    ></subscription-button>

    <div v-if="showApp"
      class="ptk__container__body"
      :class="{'ptk__container__body--show': showContainer}"
    >
      <div class="ptk__container__body-container"
        :class="{'ptk__container__body-container--show': showContainer}"
      >
        <div id="ptk__new-handler__wrapper">
          <div id="ptk__new-handler"
            @click="handlerClickHandle"
          >
            <svg viewBox="0 0 222 40" id="ptk__new-handler-bg" width="222" height="40" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M0 40 C 25 40, 43 27, 65 15 C 82 4, 93 0, 111 0 C 131 0, 142 4, 161 15 C 180 27, 198 40, 222 40 Z" stroke-width="0" fill="#0096fa" />
            </svg>
            <svg viewBox="0 0 40 15" id="ptk__new-handler-arrow" width="40" height="25" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M 0 15 L 20 0 L 40 15" stroke="#ffffff" stroke-width="6" fill="transparent"/>
              <circle cx="0" cy="15" r="3" stroke-width="0" fill="#ffffff"/>
              <circle cx="40" cy="15" r="3" stroke-width="0" fill="#ffffff"/>
            </svg>
          </div>
        </div>
        <ugoira-tool v-if="isUgoira" :tool="tool" class="ptk-tool__component">ugoira</ugoira-tool>
        <manga-tool v-else-if="isManga" :tool="tool" class="ptk-tool__component">manga</manga-tool>
        <illust-tool v-else-if="isIllust" :tool="tool" class="ptk-tool__component">illust</illust-tool>
        <novel-tool v-else-if="isNovel" :tool="tool" class="ptk-tool__component">novel</novel-tool>
        <ptk-button v-else text="Unsupported page"></ptk-button>
        <div class="ptk-pixiv-omina-content" v-if="isUgoira || isManga || isIllust">
          <ptk-button @click="passToPixivOmina"
            :title="tl('_you_need_to_download_Pixiv_Omina_for_the_button_to_work')">Pixiv Omina</ptk-button>
        </div>
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
      lastError: null
    };
  },

  computed: {
    showApp() {
      return this.pageType !== null;
    },

    hasError() {
      return this.lastError !== null;
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
          if (typeof e === 'string') {
            this.lastError = e;
          } else {
            this.lastError = e.message;
          }
        });
    },

    handlerClickHandle() {
      if (this.hasError) {
        alert(`Error: ${this.lastError}, try refresh.`);
        return;
      }

      this.containerShowed = !this.containerShowed

      browser.storage.local.set({
        featureKnown: true
      })
    },

    passToPixivOmina() {
      window.location.assign(`pixiv-omina://create-download?url=${encodeURIComponent(window.location.href)}`);
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
  z-index: 99999;

  .ptk__container__body {
    position: absolute;
    width: 100%;
    overflow: visible;
    text-align: center;
    transition: all 0.5s;

    .ptk__container__body-container {
      display: inline-block;
      position: relative;
      top: 0;
      background: #fff;
      border-radius: 30px;
      box-shadow: 0 -5px 8px rgba(0,0,0,0.3);
      overflow: hidden;
      transition: all 0.5s;
      box-sizing: border-box;
      overflow: visible;

      .button {
        &:last-child {
          margin-right: 0;
        }
      }
    }

    .ptk__container__body-container--show {
      top: -50px;
      box-shadow: 0 0 8px rgba(0,0,0,0.3);

      #ptk__new-handler-arrow {
        transform: rotate(180deg);
      }

      #ptk__new-handler__wrapper {
        top: -18px;
        height: 18px;
      }
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

  .ptk__handler--error {
    background:rgb(243, 54, 54);
  }

  #ptk__new-handler__wrapper {
    position: absolute;
    top: -15px;
    left: 0;
    width: 100%;
    height: 15px;
    transition: all 300ms;
    overflow: hidden;

    &:hover {
      top: -18px;
      height: 18px;
    }
  }

  #ptk__new-handler {
    position: relative;
    margin: 0 auto;
    width: 100px;
    height: 18px;
    cursor: pointer;
  }

  #ptk__new-handler-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
  }

  #ptk__new-handler-arrow {
      width: 13px;
      height: 8px;
      position: absolute;
      top: 5px;
      left: 44px;
      transition: all 500ms;
  }

  .ptk-tool__component {
    position: relative;
    display: inline-block;
    padding: 8px 12px;
  }

  .ptk-pixiv-omina-content {
    display: inline-block;
    padding-right: 12px;
  }
}
</style>
