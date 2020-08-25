<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
        app
        v-model="drawer"
        clipped
        hide-overlay
        :temporary="drawerTemporary">

        <v-toolbar flat
          v-if="drawerTemporary">
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
            ripple
            @click="goToVisitHistory()">
            <v-list-tile-content>
              <span>{{ tl('illust_history') }}</span>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile
            ripple
            @click="routeTo('Downloads')"
          >
            <v-list-tile-content>
              <span>{{ tl('_downloads') }}</span>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider light></v-divider>

          <v-list-tile ripple @click="routeTo('Options')">
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('settings') }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile ripple @click="routeTo('History')">
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

        <app-suggest icon="https://raw.githubusercontent.com/leoding86/webextension-pixiv-toolkit/master/src/statics/remote/img/pixiv-omina.png"
          title="Pixiv Omina"
          subTitle="A Pixiv works downloader"
          link="https://github.com/leoding86/pixiv-omina"
        ></app-suggest>
      </v-navigation-drawer>
      <v-toolbar class="v-primary" app fixed clipped-left height="56">
        <v-btn flat dark icon
          @click="drawer = !drawer" v-if="drawerTemporary">
          <v-icon
            dark>menu</v-icon>
        </v-btn>
        <span class="title v-primary header-title">
          Pixiv<strong>Toolkit</strong>
          <span style="font-size:12px">{{ version }}</span>
        </span>

        <v-spacer></v-spacer>

        <supports style="margin-bottom:0"
          :show-sponsors-link="false"
          :show-inline-sponsors-link="true"></supports>
      </v-toolbar>
      <v-content style="padding-left:0;">
        <router-view />
      </v-content>

      <update-notice></update-notice>
    </v-app>
  </div>
</template>

<script>
import Vue from 'vue'
import extConfig from '@@/../statics/manifest.json'
import Supports from '@@/components/Supports';
import AppSuggest from '@@/components/AppSuggest';
import UpdateNotice from '@@/components/UpdateNotice';

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
      drawerTemporary: false
    }
  },

  computed: {
    version () {
      return 'v' + extConfig.version;
    }
  },

  beforeMount() {
    let vm = this

    window.addEventListener('resize', this.resizeHandle)

    this.resizeHandle()
  },

  methods: {
    resizeHandle() {
      if (window.innerWidth < 1300) {
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

    goToVisitHistory() {
      if (this.browserItems['visitHistoryType'] === 'grid') {
        this.routeTo('IllustHistory');
      } else {
        this.routeTo('VisitHistory');
      }
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
}
</style>
