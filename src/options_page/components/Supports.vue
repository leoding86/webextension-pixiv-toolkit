<template>
  <div id="supports">
    <v-btn
      small
      round
      depressed
      class="support-btn" @click="openInNewTab('https://github.com/leoding86/webextension-pixiv-toolkit')">
      <img src="../assets/github.svg">
      <span class="button-text" v-show="largeWindow">{{ tl('_star_it') }}</span>
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn
      v-if="reviewInfo !== null"
      small
      round
      depressed
      class="support-btn"
      @click="openInNewTab(reviewInfo.url)"
    >
      <img :src="reviewInfo.icon">
      <span class="button-text" v-show="largeWindow">{{ tl('_give_5_stars') }}</span>
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn
      small
      round
      depressed
      v-if="showPatreon" class="support-btn" @click="openInNewTab('https://www.patreon.com/leoding')">
      <img src="../assets/patreon.png">
      <span class="button-text" v-show="largeWindow">{{ tl('_support_me') }}</span>
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn v-if="showInlineSponsorsLink"
      small
      depressed
      round class="support-btn" @click="routeTo('Sponsors')"
      style="background:#fff;">
      😍<span class="button-text" v-show="largeWindow">{{ tl('Sponsors') }}</span>
      <v-icon>keyboard_arrow_right</v-icon>
    </v-btn>

    <!-- <v-btn
     small
     class="support-btn"
     @click="openInNewTab('https://chrome.google.com/webstore/detail/manga-toolkit/nlmklhfeikfefikpbpckillcbpfjmjbf')"
    >
      <img src="../assets/manga-toolkit.png">
      {{ tl('Try_Manga_Toolkit') }}
      <v-icon right>open_in_new</v-icon>
    </v-btn> -->
  </div>
</template>

<script>
import common from "@@/modules/common";
import cr from "@@/modules/cr";
import chromeEsIcon from '../assets/chrome-es.png';
import firefoxAmoIcon from '../assets/firefox-amo.png';

export default {
  props: {
    showSponsorsLink: {
      type: Boolean,
      default: true
    },

    showInlineSponsorsLink: {
      type: Boolean,
      default: false
    },

    showPatreon: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      largeWindow: true
    };
  },

  computed: {
    reviewInfo() {
      if (common.isBrowser("edge")) {
        return null;
      } else if (common.isBrowser("chrome")) {
        return {
          icon: chromeEsIcon,
          url: 'https://chrome.google.com/webstore/detail/pixiv-toolkit/ajlcnbbeidbackfknkgknjefhmbngdnj'
        };
      } else if (common.isBrowser("firefox")) {
        return {
          icon: firefoxAmoIcon,
          url: 'https://addons.mozilla.org/en-US/firefox/addon/pixiv-toolkit/'
        }
      }
    }
  },

  mounted() {
    let vm = this;

    if (window.innerWidth < 950) {
      this.largeWindow = false;
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth < 950) {
        this.largeWindow = false;
      } else {
        this.largeWindow = true;
      }
    })
  },

  methods: {
    openInNewTab(url) {
      window.open(url, "_blank");
    }
  }
};
</script>


<style lang="scss" scoped>
#supports {
  margin-bottom: 25px;

  .support-btn {
    height: 32px;
    font-size: 14px;

    img {
      width: 23px;
    }

    .button-text {
      margin-left: 7px;
    }

    .v-icon {
      font-size: 20px;
    }
  }

  .v-btn--small {
    padding: 0 5px;
  }

  .v-icon--right {
    margin-left: 7px;
    margin-right: 0;
  }
}
</style>
