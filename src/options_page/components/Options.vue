<template>
  <v-container>
    <download-task-settings style="margin-bottom:30px;"></download-task-settings>

    <download-options style="margin-bottom:30px;"></download-options>

    <history-options style="margin-bottom:30px;"></history-options>

    <search-options v-if="false"></search-options>

    <interface-options style="margin-bottom:30px;"></interface-options>

    <other-options style="margin-bottom:30px;"></other-options>
  </v-container>
</template>

<script>
import '@@/assets/global.scss';
import CopyStr from '@/modules/Util/CopyStr';
import DownloadTaskSettings from '@@/components/options/DownloadTaskSettings';
import DownloadOptions from '@@/components/options/DownloadOptions';
import HistoryOptions from '@@/components/options/HistoryOptions';
import SearchOptions from '@@/components/options/SearchOptions';
import InterfaceOptions from '@@/components/options/InterfaceOptions';
import OtherOptions from '@@/components/options/OtherOptions';
import defaultSettings from '@/config/default';

export default {
  name: 'Options',

  components: {
    'download-task-settings': DownloadTaskSettings,
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
    .option-card-title {
      display: block;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #262626;
    }
  }
}
</style>
