<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
        app
        v-model="drawer"
        clipped
        fixed
        temporary>

        <v-toolbar flat>
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
            @click="routeTo('IllustHistory')">
            Illust View History
          </v-list-tile>
          <v-list-tile
            ripple
            @click="routeTo('Subscribes')">
            {{ tl('Subscribes') }}
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
              <v-list-tile-title>{{ tl('Sponsors') }}</v-list-tile-title>
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
          @click="drawer = !drawer">
          <v-icon
            dark>menu</v-icon>
        </v-btn>
        <span class="title v-primary">{{ tl('extName') }} <span style="font-size:12px">{{ version }}</span></span>
      </v-toolbar>
      <v-content>
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
      drawer: false,
      browserItems: {}
    }
  },

  computed: {
    version () {
      return 'v' + extConfig.version;
    }
  },

  mounted() {
    //
  },

  methods: {
      routeTo (name) {
        this.$router.push({
          name: name
        })
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
