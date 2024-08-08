<template>
  <div class="ptk__container" :class="ptkContainerClasses" :id="isDark ? 'ptk-theme__dark' : ''">
    <div class="ptk__container__body" :class="ptkCOntainerBodyClasses">
      <div class="ptk__container__body-container">
        <div v-if="!browserItems.guideShowed"
          class="ptk__guide">
          <div class="ptk__guide-body">
            <ptk-button style="display: block">P*</ptk-button>
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
            <div id="ptk__new-handler-bg">
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
        </div>
        <div id="ptk__action__wrapper">
          <ptk-button class="ptk__inline-handler"
            v-if="browserItems.downloadPanelStyle == 2 && ['left', 'center'].indexOf(browserItems.downloadPanelPosition) >= 0"
            @click="handlerClickHandle"
          >
            <span>P*</span>
          </ptk-button>
          <div class="ptk__action__wrapper__body">
            <slot></slot>
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
import browser from '@/modules/Extension/browser';
import Button from '@/content_scripts/components/Button';
import ThemeDetector from '@/content_scripts/modules/ThemeDetector';

export default {
  components: {
    'ptk-button': Button
  },

  props: {
    lastError: {
      required: false,
      type    : String,
      default: undefined
    },

    panelStyle: {
      required: true,
      type: Number,
      default: 1
    },

    panelPosition: {
      required: true,
      type: String,
      default: 'center'
    }
  },

  data() {
    return {
      currentUrl: null,
      isDark: false,
      collapse: true,
    };
  },

  computed: {
    hasError() {
      return !!this.lastError;
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

      classes.push(`ptk__container--type-${this.panelStyle}`);
      classes.push(`ptk__container--position-${this.panelPosition}`);

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

  created() {
    this.collapse = !this.browserItems.autoActivateDownloadPanel;
  },

  beforeMount() {
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

  methods: {
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
    border: 2px solid #fff;
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
    padding: 3px;
  }

  .ptk__action__wrapper__body {
    display: flex;
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
    width: 100%;
    height: 18px;
    cursor: pointer;
  }

  #ptk__new-handler-bg {
    width: 40px;
    height: 30px;
    margin: 0 auto;
    position: relative;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    background-color: #0096fa;
  }

  #ptk__new-handler-arrow,
  #ptk__new-handler-cross {
    width: 13px;
    height: 8px;
    position: absolute;
    top: 5px;
    left: 14px;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;

    .button {
      margin-right: 0;
    }
  }

  @keyframes guide {
    0% {
      top: -75px;
    }

    50% {
      top: -70px
    }

    100% {
      top: -75px;
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
