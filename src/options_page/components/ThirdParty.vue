<template>
  <v-container>
    <span class="card-title">{{ tl('Third_Party') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list
        two-line>
        <v-list-tile
          v-for="item in thirdPartList"
          ripple
          @click="openInNew(item.url)"
          :key="item.name">
          <v-list-tile-content>
            <v-list-tile-title>{{ item.name }} <span style="font-size:12px;">{{ item.version }}</span></v-list-tile-title>
            <v-list-tile-sub-title>{{ item.desc }}</v-list-tile-sub-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-btn flat icon>
              <v-icon>open_in_new</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import cr from '@@/modules/cr'

export default {
  data () {
    return {
      thirdPartList: [{
        name: 'ffmpeg.wasm',
        version: '0.11.6',
        desc: 'ffmpeg.wasm is a pure Webassembly / Javascript port of FFmpeg. It enables video & audio record, convert and stream right inside browsers.',
        url: 'https://github.com/ffmpegwasm/ffmpeg.wasm'
      }, {
        name: 'jszip',
        version: '3.1.5',
        desc: 'Create, read and edit .zip files with Javascript',
        url: 'https://github.com/Stuk/jszip'
      }, {
        name: 'vuejs',
        version: '2.6.10',
        desc: 'Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.',
        url: 'https://github.com/vuejs/vue'
      }, {
        name: 'vuetify',
        version: '1.5.9',
        desc: 'Material Component Framework for Vue.js 2',
        url: 'https://github.com/vuetifyjs/vuetify'
      }, {
        name: 'vue-i18n',
        version: '8.18.2',
        desc: 'Vue I18n is internationalization plugin for Vue.js',
        url: 'http://kazupon.github.io/vue-i18n/'
      }]
    }
  },

  methods: {
    openInNew (url) {
      window.open(url, '_blank');
    },

    tl(string) {
      return cr._e(string);
    }
  }
}
</script>


<style lang="scss" scoped>
#app {
  .card-title {
    display: block;
    font-size: 18px;
    margin-bottom: 10px;
  }
}
</style>
