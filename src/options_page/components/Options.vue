<template>
  <v-container>
    <ugoira-options></ugoira-options>

    <illustration-options></illustration-options>

    <manga-options></manga-options>

    <novel-options></novel-options>

    <pixiv-comic-options></pixiv-comic-options>

    <download-options ></download-options>

    <history-options></history-options>

    <search-options v-if="false"></search-options>

    <interface-options></interface-options>

    <other-options></other-options>
  </v-container>
</template>

<script>
import '@@/assets/global.scss';
import CopyStr from '@/modules/Util/CopyStr';
import UgoiraOptions from '@@/components/options/UgoiraOptions';
import IllustrationOptions from '@@/components/options/IllustrationOptions';
import MangaOptions from '@@/components/options/MangaOptions';
import NovelOptions from '@@/components/options/NovelOptions';
import PixivComicOptions from '@@/components/options/PixivComicOptions';
import DownloadOptions from '@@/components/options/DownloadOptions';
import HistoryOptions from '@@/components/options/HistoryOptions';
import SearchOptions from '@@/components/options/SearchOptions';
import InterfaceOptions from '@@/components/options/InterfaceOptions';
import OtherOptions from '@@/components/options/OtherOptions';
import defaultSettings from '@/config/default';

export default {
  name: 'Options',

  components: {
    'ugoira-options': UgoiraOptions,
    'illustration-options': IllustrationOptions,
    'manga-options': MangaOptions,
    'novel-options': NovelOptions,
    'pixiv-comic-options': PixivComicOptions,
    'download-options': DownloadOptions,
    'history-options': HistoryOptions,
    'search-options': SearchOptions,
    'interface-options': InterfaceOptions,
    'other-options': OtherOptions
  }
}
</script>

<style lang="scss">
#app {
  .option-section {
    margin-bottom: 30px;

    .option-card-title {
      display: block;
      font-size: 18px;
      margin-bottom: 10px;
    }
  }
}
</style>
