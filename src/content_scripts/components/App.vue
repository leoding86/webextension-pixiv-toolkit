<template>
  <div :class="{'ptk__container': true}">
    <subscription-button class="ptk__handler"
      style="right:180px;"
      v-if="showSubscribe"
      :user-id="userId"
    ></subscription-button>

    <div class="ptk__container__body">
      <div class="ptk__container__body-container"
        :class="{'ptk__container__body-container--show': showContainer, 'ptk__container__body-container--hide': !showApp}"
      >
        <div v-if="showApp && !isUndetermined && !browserItems.guideShowed"
          class="ptk__guide">
          <div class="ptk__guide-body">
            <ptk-button style="display: block">Pixiv Toolkit</ptk-button>
            <svg viewBox="0 0 10 15" id="ptk__guide-arrow" width="10" height="15" style="position: relative; top: 3px" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M5 0 L5 15 L10 10 M5 15 L0 10" stroke="#333" stroke-width="2" fill="transparent" />
            </svg>
          </div>
        </div>
        <div id="ptk__new-handler__wrapper">
          <div id="ptk__new-handler"
            @click="handlerClickHandle"
          >
            <svg viewBox="0 0 222 40" id="ptk__new-handler-bg" width="222" height="40" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M0 40 C 25 40, 43 27, 65 15 C 82 4, 93 0, 111 0 C 131 0, 142 4, 161 15 C 180 27, 198 40, 222 40 Z" stroke-width="0" :fill="hasError ? '#ff3b3b' : '#0096fa'" />
            </svg>
            <svg v-if="!hasError" viewBox="0 0 40 15" id="ptk__new-handler-arrow" width="40" height="25" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M 0 15 L 20 0 L 40 15" stroke="#ffffff" stroke-width="6" fill="transparent"/>
              <circle cx="0" cy="15" r="3" stroke-width="0" fill="#ffffff"/>
              <circle cx="40" cy="15" r="3" stroke-width="0" fill="#ffffff"/>
            </svg>
            <svg v-if="hasError" viewBox="0 0 40 40" id="ptk__new-handler-cross" width="40" height="40" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M0 0 L40 40" stroke="#ffffff" stroke-width="10" fill="transparent"/>
              <path d="M0 40 L40 0" stroke="#ffffff" stroke-width="10" fill="transparent"/>
              <circle cx="0" cy="0" r="5" stroke-width="0" fill="#ffffff"/>
              <circle cx="40" cy="40" r="5" stroke-width="0" fill="#ffffff"/>
              <circle cx="40" cy="0" r="5" stroke-width="0" fill="#ffffff"/>
              <circle cx="0" cy="40" r="5" stroke-width="0" fill="#ffffff"/>
            </svg>
          </div>
        </div>
        <ugoira-tool v-if="isUgoira" :tool="tool" class="ptk-tool__component">ugoira</ugoira-tool>
        <manga-tool v-else-if="isManga" :tool="tool" class="ptk-tool__component">manga</manga-tool>
        <illust-tool v-else-if="isIllust" :tool="tool" class="ptk-tool__component">illust</illust-tool>
        <novel-tool v-else-if="isNovel" :tool="tool" class="ptk-tool__component">novel</novel-tool>
        <div class="ptk-tool__component" v-else>
          <ptk-button text="Parsing information"></ptk-button>
        </div>
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
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort/RendererPort'
import Button from '@/content_scripts/components/Button'
import InvalidPageError from '@/content_scripts/errors/InvalidPageError'

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
    },

    iconContent() {
      return this.isUndetermined ? 'P?' : 'P*';
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
              this.pageType = null;
            }

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
        guideShowed: true
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

    .ptk__container__body-container--hide {
      top: 15px;
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

  #ptk__new-handler-arrow,
  #ptk__new-handler-cross {
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

  .ptk__guide {
    width: 100%;
    height: 0px;
    overflow: visible;
    position: absolute;
    top: -70px;
    animation-name: guide;
    animation-iteration-count: infinite;
    animation-duration: 1s;
  }

  .ptk__guide-body {
    width: 120px;
    margin: 0 auto;
  }

  @keyframes guide {
    0% {
      top: -70px;
    }

    50% {
      top: -65px
    }

    100% {
      top: -70px;
    }
  }
}
</style>
