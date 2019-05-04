<template>
  <div id="supports">
    <v-btn class="support-btn" @click="openInNewTab('https://www.patreon.com/leoding')">
      <img src="../assets/patreon.png">
      Become a patron !
      <v-icon right>open_in_new</v-icon>
    </v-btn>
    <v-btn
      class="support-btn"
      v-if="isChrome"
      @click="openInNewTab('https://chrome.google.com/webstore/detail/pixiv-toolkit/ajlcnbbeidbackfknkgknjefhmbngdnj')"
    >
      <img src="../assets/chrome-es.png">
      Give 5 stars !
      <v-icon right>open_in_new</v-icon>
    </v-btn>

    <v-card v-if="showSponsorsLink">
      <v-list>
        <v-list-tile ripple @click="showSponsors">
          <v-list-tile-content>
            <v-list-tile-title>Sponsors</v-list-tile-title>
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
import common from "@/modules/common";
import cr from "@/modules/cr";

export default {
  props: {
    showSponsorsLink: {
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
    height: 46px;
    font-size: 16px;
    margin: 10px 10px 10px 0;

    img {
      width: 36px;
      margin-right: 10px;
    }
  }
}
</style>
