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

        <v-list dense>
          <v-list-tile
            ripple
            @click="illustHistoryClickHandle">
            <v-list-tile-content>
              <span>Illust History <sup v-if="!plusVersion" style="padding-left:5px;color:red;font-size:10px">Plus</sup></span>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>open_in_new</v-icon>
            </v-list-tile-action>
          </v-list-tile>
          <!-- <v-list-tile
            ripple
            @click="routeTo('Subscribes')">
            {{ tl('Subscribes') }} <sup v-if="!plusVersion" style="padding-left:5px;color:red;font-size:10px">Plus</sup>
          </v-list-tile> -->

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
        </v-list>
      </v-navigation-drawer>
      <v-toolbar class="v-primary" app fixed clipped-left height="56">
        <v-btn flat dark icon
          @click="drawer = !drawer" v-if="drawerTemporary">
          <v-icon
            dark>menu</v-icon>
        </v-btn>
        <span class="title v-primary">
          {{ tl('extName') }}
          <span style="font-size:12px">{{ version }}</span>
          <sup v-if="plusVersion" style="font-size:12px;font-weight:700;">Plus v{{plusVersion}}</sup>
        </span>
      </v-toolbar>
      <v-content style="padding-left:0;">
        <router-view />
      </v-content>
    </v-app>
  </div>
</template>

<script>
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import cr from './modules/cr'
import extConfig from '@@/../statics/manifest.json'
import { Storage as BrowserStorage } from '@/modules/Browser'

Vue.use(Vuetify)

export default {
  name: 'App',

  data () {
    return {
      drawer: true,
      browserItems: {},
      drawerTemporary: false
    }
  },

  computed: {
    version () {
      return 'v' + extConfig.version;
    },

    plusVersion() {
      return this.$root.plusVersion
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
      console.log('resize')
    },

      routeTo (name) {
        this.$router.push({
          name: name
        })
      },

      illustHistoryClickHandle() {
        if (this.plusVersion) {
          browser.tabs.create({
            url: 'chrome-extension://fnljpdfpdilgbfgdcmhckjhoibfdkgdk/options_page/index.html#/illust-history'
          })
        } else {
          this.$router.push({
            name: 'IllustHistory'
          })
        }
      },

      tl (string) {
          return cr._e(string);
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
}
</style>
