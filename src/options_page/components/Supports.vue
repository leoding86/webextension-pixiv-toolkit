<template>
  <div id="supports">
    <v-btn
      small
      v-if="showPatreon" class="support-btn" @click="openInNewTab('https://www.patreon.com/leoding')">
      <img src="../assets/patreon.png">
      {{ tl('Become_a_patron') }} !
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-btn
      small
      class="support-btn"
      v-if="isChrome"
      @click="openInNewTab('https://chrome.google.com/webstore/detail/pixiv-toolkit/ajlcnbbeidbackfknkgknjefhmbngdnj')"
    >
      <img src="../assets/chrome-es.png">
      {{ tl('Give_5_stars') }} !
      <v-icon right>open_in_new</v-icon>
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

    <v-card v-if="showSponsorsLink">
      <v-list>
        <v-list-tile ripple @click="showSponsors">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Sponsors') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
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

    showPatreon: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      isChrome: false
    };
  },

  mounted() {
    if (common.isBrowser("chrome")) {
      this.isChrome = true;
    }
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
    height: 40px;
    font-size: 16px;
    margin: 0 10px 10px 0;

    img {
      width: 30px;
      margin-right: 10px;
    }
  }
}
</style>
