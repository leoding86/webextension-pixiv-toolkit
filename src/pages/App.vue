<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
        app
        v-model="drawer"
        absolute
        temporary>

        <v-toolbar flat>
          <v-list>
            <v-list-tile>
              <v-list-tile-title>
                Menu
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-toolbar>

        <v-list dense>
          <v-list-tile ripple @click="routeTo('Options')">
            <v-list-tile-content>
              <v-list-tile-title>Options</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile ripple @click="routeTo('ThirdParts')">
            <v-list-tile-content>
              <v-list-tile-title>Third-Parts</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar class="v-primary" app absolute clipped-left height="56">
        <v-btn flat dark icon
          @click="drawer = !drawer">
          <v-icon
            dark>menu</v-icon>
        </v-btn>
        <span class="title v-primary">{{ lt('extName') }} <span style="font-size:12px">{{ version }}</span></span>
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
import extConfig from '@/../statics/manifest.json'

Vue.use(Vuetify)

export default {
  name: 'App',

  data () {
    return {
      drawer: false
    }
  },

  computed: {
    version () {
      return 'v' + extConfig.version;
    }
  },

  methods: {
      routeTo (name) {
        this.$router.push({
          name: name
        })
      },

      lt (string) {
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
