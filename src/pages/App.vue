<template>
  <div id="app">
    <v-app>
      <v-toolbar class="v-primary" app absolute clipped-left height="56">
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

  computed: {
    version () {
      return 'v' + extConfig.version;
    }
  },

  methods: {
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
