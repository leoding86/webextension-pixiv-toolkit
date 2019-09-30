<template>
    <v-container style="max-width: 640px;">
        <supports></supports>

        <ugoira-options></ugoira-options>

        <manga-options></manga-options>

        <novel-options></novel-options>

        <download-options></download-options>

        <history-options></history-options>

        <search-options></search-options>

        <other-options></other-options>
    </v-container>
</template>

<script>
import '@@/assets/global.scss'
import '@/mixins/SuperMixin';
import Supports from '@@/components/Supports';
import UgoiraOptions from '@@/components/options/UgoiraOptions';
import MangaOptions from '@@/components/options/MangaOptions';
import NovelOptions from '@@/components/options/NovelOptions';
import DownloadOptions from '@@/components/options/DownloadOptions';
import HistoryOptions from '@@/components/options/HistoryOptions';
import SearchOptions from '@@/components/options/SearchOptions';
import OtherOptions from '@@/components/options/OtherOptions';

export default {
    name: 'Options',

    components: {
      supports: Supports,
      'ugoira-options': UgoiraOptions,
      'manga-options': MangaOptions,
      'novel-options': NovelOptions,
      'download-options': DownloadOptions,
      'history-options': HistoryOptions,
      'search-options': SearchOptions,
      'other-options': OtherOptions
    },

    data () {
        return {

            isChrome: false,
        }
    }
}
</script>

<style lang="scss">
#app {
  .option-section {
    margin: 30px 0;

    .option-card-title {
        display: block;
        font-size: 18px;
        margin-bottom: 10px;
    }
  }
}
</style>
