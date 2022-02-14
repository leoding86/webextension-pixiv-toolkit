<template>
  <div class="ptk__container" :class="ptkContainerClasses" :id="isDark ? 'ptk-theme__dark' : ''">
    <div class="ptk__container__body" :class="ptkCOntainerBodyClasses">
      <div class="ptk__container__body-container"
        :class="{
          'ptk__container__body-container--hide': !showApp,
        }"
      >
        <div v-if="showApp && !isUndetermined && !browserItems.guideShowed"
          class="ptk__guide">
          <div class="ptk__guide-body">
            <ptk-button style="display: block">Pixiv Toolkit</ptk-button>
            <svg viewBox="0 0 10 15" id="ptk__guide-arrow" width="10" height="15" style="position: relative; top: 3px" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M5 0 L5 15 L10 10 M5 15 L0 10" :stroke="isDark ? '#fff' : '#333'" stroke-width="2" fill="transparent" />
            </svg>
          </div>
        </div>
        <div id="ptk__new-handler__wrapper"
          v-if="browserItems.downloadPanelStyle == 1"
        >
          <div id="ptk__new-handler"
            @click="handlerClickHandle"
          >
            <svg viewBox="0 0 222 40" id="ptk__new-handler-bg" width="222" height="40" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M0 40 C 25 40, 43 27, 65 15 C 82 4, 93 0, 111 0 C 131 0, 142 4, 161 15 C 180 27, 198 40, 222 40 Z" stroke-width="0" :fill="hasError ? '#ff3b3b' : handlerBackground" />
            </svg>
            <svg v-if="!hasError" viewBox="0 0 40 15" id="ptk__new-handler-arrow" width="40" height="25" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M 0 15 L 20 0 L 40 15" :stroke="handlerForeground" stroke-width="6" fill="transparent"/>
              <circle cx="0" cy="15" r="3" stroke-width="0" :fill="handlerForeground"/>
              <circle cx="40" cy="15" r="3" stroke-width="0" :fill="handlerForeground"/>
            </svg>
            <svg v-if="hasError" viewBox="0 0 40 40" id="ptk__new-handler-cross" width="40" height="40" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
              <path d="M0 0 L40 40" :stroke="handlerForeground" stroke-width="10" fill="transparent"/>
              <path d="M0 40 L40 0" :stroke="handlerForeground" stroke-width="10" fill="transparent"/>
              <circle cx="0" cy="0" r="5" stroke-width="0" :fill="handlerForeground"/>
              <circle cx="40" cy="40" r="5" stroke-width="0" :fill="handlerForeground"/>
              <circle cx="40" cy="0" r="5" stroke-width="0" :fill="handlerForeground"/>
              <circle cx="0" cy="40" r="5" stroke-width="0" :fill="handlerForeground"/>
            </svg>
          </div>
        </div>
        <div id="ptk__action__wrapper">
          <ptk-button class="ptk__inline-handler"
            v-if="browserItems.downloadPanelStyle == 2 && ['left', 'center'].indexOf(browserItems.downloadPanelPosition) >= 0"
            @click="handlerClickHandle"
          >
            <span>P*</span>
          </ptk-button>
          <div class="ptk__action__wrapper__body">
            <ugoira-tool v-if="isUgoira" :tool="tool">ugoira</ugoira-tool>
            <manga-tool v-else-if="isManga" :tool="tool">manga</manga-tool>
            <illust-tool v-else-if="isIllust" :tool="tool">illust</illust-tool>
            <novel-tool v-else-if="isNovel" :tool="tool">novel</novel-tool>
            <ptk-button v-else text="Parsing information"></ptk-button>
          </div>
          <ptk-button class="ptk__inline-handler ptk__inline-handler--right"
            v-if="browserItems.downloadPanelStyle == 2 && browserItems.downloadPanelPosition == 'right'"
            @click="handlerClickHandle"
          >
            <span>P*</span>
          </ptk-button>
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
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort/RendererPort'
import Button from '@/content_scripts/components/Button'
import InvalidPageError from '@/content_scripts/errors/InvalidPageError'
import ThemeDetector from '@/content_scripts/ThemeDetector';

export default {
  components: {
    "novel-tool": Novel,
    'manga-tool': Manga,
    'illust-tool': Illust,
    'ugoira-tool': Ugoira,
    'ptk-button': Button
  },

  data() {
    return {
      pageType: null,
      currentUrl: null,
      tool: null,
      containerShowed: false,
      lastError: null,
      isDark: false,
      collapse: false,
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

    userId() {
      if (this.tool) {
        return parseInt(this.tool.getUserId())
      }

      return 0
    },

    handlerBackground() {
      return this.isDark ? '#666666' : '#0096fa';
    },

    handlerForeground() {
      return '#ffffff';
    },

    ptkContainerClasses() {
      let classes = [];

      if (this.browserItems.downloadPanelStyle) {
        classes.push(`ptk__container--type-${this.browserItems.downloadPanelStyle}`);
      }

      if (this.browserItems.downloadPanelPosition) {
        classes.push(`ptk__container--position-${this.browserItems.downloadPanelPosition}`);
      }

      return classes;
    },

    ptkCOntainerBodyClasses() {
      let classes = [];

      if (this.collapse) {
        classes.push('ptk__container__body--collapse');
      }

      return classes;
    }
  },

  beforeMount() {
    this.illustHistoryPort = IllustHistoryPort.getInstance();
    this.detector = new Detector();
    this.themeDetector = ThemeDetector.getDefault();

    this.isDark = this.themeDetector.isDark();

    this.themeDetector.addListener('change', () => {
      if (this.themeDetector.isDark()) {
        this.isDark = true;
      } else {
        this.isDark = false;
      }
    });
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
          vm.collapse = !vm.browserItems.autoActivateDownloadPanel;

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

    disableGuide() {
      browser.storage.local.set({
        guideShowed: true
      });
    },

    checkError() {
      if (this.hasError) {
        throw new Error(`Error: ${this.lastError}, try refresh.`);
      }
    },

    handlerClickHandle() {
      try {
        this.checkError();
        this.collapse = !this.collapse
        this.disableGuide();
      } catch (error) {
        alert(error.message);
      }
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
    display: flex;
    justify-content: center;
    margin: 0 80px 0 20px;
    overflow: visible;
    transition: all 0.5s;

    &--panel-left {
      justify-content: left;
    }

    &--panel-right {
      justify-content: right;
    }
  }

  .ptk__container__body-container {
    position: relative;
    top: -50px;
    background: #fff;
    border-radius: 30px;
    box-shadow: 0 0 8px rgba(0,0,0,0.3);
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

  #ptk__action__wrapper {
    display: flex;
    padding: 5px;
  }

  .ptk__action__wrapper--collapse {
    .ptk__inline-handler {
      margin: 0;
    }
  }

  .ptk__inline-handler {
    padding: 0;

    &--right {
      margin-left: 5px;
    }

    span {
      display: block;
      width: 27px;
      line-height: 27px;
      text-align: center;
    }
  }

  .ptk__container__body-container--hide {
    top: 15px;
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
    width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
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

.ptk__container--type-1 {
  .ptk__container__body-container {
    #ptk__new-handler-arrow {
      transform: rotate(180deg);
    }

    #ptk__new-handler__wrapper {
      top: -18px;
      height: 18px;
    }
  }

  .ptk__container__body--collapse {
    #ptk__new-handler-arrow {
      transform: rotate(0deg);
    }

    .ptk__container__body-container {
      top: 0px;
      box-shadow: 0 -5px 8px rgba(0,0,0,0.3);
    }
  }
}

.ptk__container--type-2 {
  .ptk__container__body--collapse {
    .ptk__inline-handler {
      margin-right: 0;
    }

    .ptk__action__wrapper__body {
      display: none;
    }
  }
}

.ptk__container--position-left {
  .ptk__container__body {
    justify-content: start;
  }
}

.ptk__container--position-right {
  .ptk__container__body {
    justify-content: end;
  }
}

.ptk__container--style-1 {
  .ptk__inline-handler {
    display: none;
  }
}

.ptk__container--style-2 {
  #ptk__new-handler__wrapper {
    display: none;
  }
}

.ptk__tool {
  display: flex;

  a:last-child {
    margin-right: 0;
  }
}
</style>
