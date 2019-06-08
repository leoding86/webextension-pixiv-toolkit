<template>
  <div :class="{'ptk__container': true, 'ptk__container--show': containerShowed}" v-if="showApp">
    <div :class="{'ptk__handler': true, 'ptk__handler--active': containerShowed}"
      @click="handlerClickHandle"
    >P*</div>
    <ugoira-tool v-if="isUgoira" :tool="tool">ugoira</ugoira-tool>
    <manga-tool v-else-if="isManga" :tool="tool">manga</manga-tool>
    <manga-tool v-else-if="isIllust" :tool="tool">illust</manga-tool>
    <novel-tool v-else-if="isNovel" :tool="tool">novel</novel-tool>
    <div v-else>
      <p>Unkown page</p>
    </div>
  </div>
</template>

<script>
import Detector from "@/content_scripts/Detector";
import { storage as browserStorage } from '@/content_scripts/Browser';
import Novel from "@/content_scripts/components/Novel";
import Manga from '@/content_scripts/components/Manga';
import Ugoira from '@/content_scripts/components/Ugoira'

export default {
  components: {
    "novel-tool": Novel,
    'manga-tool': Manga,
    'ugoira-tool': Ugoira
  },

  data() {
    return {
      detector: new Detector(),
      pageType: null,
      currentUrl: null,
      tool: null,
      containerShowed: false,
      browserItems: null
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
    }
  },

  mounted() {
    let vm = window.thisApp = this;

    browserStorage.onChanged.addListener((changes, namespace) => {
      for (let key in changes) {
        vm.browserItems[key] = changes[key].newValue;
      }
    });

    browserStorage.get(null, items => {
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
          }, 200)

          vm.tool = tool;
          vm.pageType = vm.detector.currentType;
        })
        .catch(e => {
          console.log(e);
        });
    },

    handlerClickHandle() {
      this.containerShowed = !this.containerShowed

      browserStorage.set({
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
    right: 150px;
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
