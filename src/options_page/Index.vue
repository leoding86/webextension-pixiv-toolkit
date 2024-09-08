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
                {{ tl('Menu') }}
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-toolbar>

        <v-divider light></v-divider>

        <v-list dense>
          <v-list-tile
            v-if="browserItems.enableSaveVisitHistory === true"
            ripple
            @click="goToHistory()">
            <v-list-tile-content>
              <span>{{ tl('_history') }}</span>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider light v-if="browserItems.enableSaveVisitHistory === true || browserItems.enableSaveDownloadHistory === 1"></v-divider>

          <v-list-tile
            ripple
            @click="openDownloadManager"
          >
            <v-list-tile-content>
              <span>{{ tl('_download_manager') }} <v-icon small>open_in_new</v-icon></span>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider light></v-divider>

          <v-list-tile ripple @click="routeTo('Options')">
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('settings') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile ripple @click="routeTo('ChangeLogs')">
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('Change_History') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile ripple @click="routeTo('Sponsors')">
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('Sponsors') }}😍</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider light></v-divider>
          <v-list-tile ripple @click="routeTo('ThirdParty')">
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('Third_Party') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider light></v-divider>
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
          <span style="font-size:12px">Next {{ version }}</span>
        </span>

        <v-spacer></v-spacer>

        <supports style="margin-bottom:0"
          :show-sponsors-link="false"
          :show-inline-sponsors-link="true"></supports>
      </v-toolbar>
      <v-content style="padding-left:0;">
        <router-view style="max-width: 800px;" />
      </v-content>

      <update-notice></update-notice>

      <div style="height:100px;"></div>
    </v-app>

    <app-suggest
      :class="{
        'app-suggest_container': true,
        'app-suggest_container--show': showAppSuggest
      }"
      v-if="displayAppSuggest"
      icon="https://raw.githubusercontent.com/leoding86/webextension-pixiv-toolkit/master/src/statics/remote/img/pixiv-omina.png"
      title="Pixiv Omina"
      subTitle="A more powerful Pixiv downloader"
      link="https://github.com/leoding86/pixiv-omina"
    ></app-suggest>
  </div>
</template>

<script>
import Supports from '@@/components/Supports';
import AppSuggest from '@@/components/AppSuggest';
import UpdateNotice from '@@/components/UpdateNotice';
import browser from '@/modules/Extension/browser';

export default {
  name: 'App',

  components: {
    'supports': Supports,
    'app-suggest': AppSuggest,
    'update-notice': UpdateNotice
  },

  data () {
    return {
      drawer: true,
      drawerTemporary: false,
      displayAppSuggest: false,
      showAppSuggest: false
    }
  },

  computed: {
    version () {
      return 'v' + browser.runtime.getManifest().version;
    }
  },

  created() {
    this.downloadManagerOpenning = false;
  },

  beforeMount() {
    let vm = this

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

    goToHistory() {
      this.routeTo('History');
    },

    async openDownloadManager() {
      if (this.downloadManagerOpenning) {
        return;
      }

      this.downloadManagerOpenning = true;

      let response;

      let timeout = setTimeout(() => {
        window.open(browser.runtime.getURL('options_page/downloads.html'), '_blank');
        this.downloadManagerOpenning = false;
      }, 600);

      response = await browser.runtime.sendMessage({
        action: 'download:checkIfDownloadManagerOpened'
      });

      clearTimeout(timeout);

      if (response.result) {
        browser.tabs.update(response.data.tabId, { active: true });
      } else {
        window.open(browser.runtime.getURL('options_page/downloads.html'), '_blank');
      }

      this.downloadManagerOpenning = false;
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
