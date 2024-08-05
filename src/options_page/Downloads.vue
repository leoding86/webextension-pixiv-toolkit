<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
        app
        v-model="drawer"
        clipped
        hide-overlay
        :temporary="drawerTemporary">

        <v-toolbar flat>
          <v-list>
            <v-list-tile>
              <v-list-tile-title>
                {{ tl('_download_manager') }}
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-toolbar>

        <v-divider light></v-divider>

        <v-list dense>
          <v-list-tile
            ripple
          >
            <v-list-tile-content>
              <span>{{ tl('_all') }}</span>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-divider light></v-divider>

        <v-list dense>
          <v-list-tile ripple @click="openSettings">
            <v-list-tile-content>
              <span>{{ tl('_settings') }} <v-icon small>open_in_new</v-icon></span>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar class="v-primary" app fixed clipped-left height="56">
        <v-btn flat dark icon
          @click="drawer = !drawer" v-if="drawerTemporary">
          <v-icon
            dark>menu</v-icon>
        </v-btn>
        <span class="title v-primary header-title">
          Pixiv<strong>Toolkit</strong>
          <span style="font-size:12px">Next</span>
        </span>

        <v-spacer></v-spacer>

        <supports style="margin-bottom:0"
          :show-sponsors-link="false"
          :show-inline-sponsors-link="true"
          :open-sponsors-in-new="true"></supports>
      </v-toolbar>
      <v-content style="padding-left:0;">
        <download-manager v-if="openedTabId <= 0"
          class="container conatiner-small" style="max-width:800px;"
        ></download-manager>
        <div v-else class="container container small" style="max-width:800px;">
          <v-alert :value="true" type="warning">
            {{ tl('_download_manager_is_already_opened') }}
            <a style="text-decoration: underline;color:#fff;" @click="switchToActive">{{ tl('_switch_to_it_and_close') }}</a>
            <v-icon style="font-size:16px;color:#fff">open_in_new</v-icon>
          </v-alert>
        </div>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import DownloadManager from '@@/components/DownloadManager';
import Supports from '@@/components/Supports';
import browser from '@/modules/Extension/browser';

export default {
  name: 'App',

  components: {
    'download-manager': DownloadManager,
    'supports': Supports
  },

  data () {
    return {
      drawer: true,
      drawerTemporary: false,
    }
  },

  computed: {
    version () {
      return 'v' + browser.runtime.getManifest().version;
    },

    openedTabId() {
      return this.$root.openedTabId;
    },

    openedWindowId() {
      return this.$root.openedWindowId;
    }
  },

  created() {
    this.showStartupDialog = !this.browserItems.importantNoticeDisplayed;
  },

  beforeMount() {
    window.addEventListener('resize', this.resizeHandle)

    this.resizeHandle();

    browser.runtime.getPlatformInfo(platformInfo => {
      if (platformInfo.os === 'win' && platformInfo.arch !== 'arm') {
        this.displayAppSuggest = true;

        this.$nextTick(() => {
          setTimeout(() => this.showAppSuggest = true, 1000);
        });
      }
    });
  },

  methods: {
    resizeHandle() {
      if (window.innerWidth < 1400) {
        if (!this.drawerTemporary) {
          this.drawerTemporary = true
          this.drawer = false
        }
      } else {
        if (this.drawerTemporary) {
          this.drawerTemporary = false
          this.drawer = true
        }
      }
    },

    openSettings() {
      window.open(browser.runtime.getURL('options_page/index.html'), '_blank');
    },

    async switchToActive() {console.log(this.openedTabId)
      await browser.windows.update(this.openedWindowId, {
        focused: true,
      });

      await browser.tabs.update(this.openedTabId, {
        active: true,
      });

      window.close();
    }
  }
}
</script>

<style lang="scss">
$primary-blue-color: #3367d6;
$primary-blue-text-color: #fff;

#app {
    .v-primary {
        background: $primary-blue-color;
        color: $primary-blue-text-color;
    }

    .v-toolbar {
        min-height: 56px;
    }

    .header-title {
      font-weight: 300;

      strong {
        font-weight: 700;
      }
    }

    .app-suggest_container {
      position: fixed;
      bottom: 10px;
      left: 10px;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      background: rgb(255, 255, 255);
      transform: translateX(-300px);
      transition: 800ms ease all;
    }

    .app-suggest_container--show {
      transform: translateX(0px);
    }
}
</style>
