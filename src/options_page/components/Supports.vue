<template>
  <div id="supports">
    <v-btn
      small
      round
      depressed
      v-if="showPatreon" class="support-btn" @click="openInNewTab('https://www.patreon.com/leoding')">
      <img src="../assets/patreon.png">
      <span class="button-text" v-show="largeWindow">{{ tl('Become_a_patron') }} !</span>
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn
      small
      round
      depressed
      class="support-btn"
      v-if="isChrome"
      @click="openInNewTab('https://chrome.google.com/webstore/detail/pixiv-toolkit/ajlcnbbeidbackfknkgknjefhmbngdnj')"
    >
      <img src="../assets/chrome-es.png">
      <span class="button-text" v-show="largeWindow">{{ tl('Give_5_stars') }}</span>
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn
      small
      round
      depressed
      class="support-btn"
      v-if="isFirefox"
      @click="openInNewTab('')">
      <img src="../assets/firefox-amo.png">
      <span class="button-text" v-show="largeWindow">{{ tl('Give_5_stars') }}</span>
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn
      small
      round
      depressed
      v-if="showPatreon" class="support-btn" @click="openInNewTab('https://github.com/leoding86/webextension-pixiv-toolkit')">
      <img src="../assets/github.svg">
      <span class="button-text" v-show="largeWindow">{{ tl('Star_it') }}</span>
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn v-if="showInlineSponsorsLink"
      small
      depressed
      round class="support-btn" @click="showSponsors"
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
      isChrome: false,
      isFirefox: false,
      largeWindow: true
    };
  },

  mounted() {
    let vm = this;

    if (common.isBrowser("chrome")) {
      this.isChrome = true;
    } else if (common.isBrowser("firefox")) {
      this.isFirefox = true;
    }

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
    showSponsors() {
      this.$router.push({
        name: "Sponsors"
      });
    },

    openInNewTab(url) {
      window.open(url, "_blank");
    },

    tl(string) {
      return cr._e(string);
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
