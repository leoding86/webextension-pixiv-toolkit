<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 10:45:18
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-08 13:27:35
 * @FilePath: \webextension-pixiv-toolkit\src\options_page\components\NewSettings.vue
-->
<template>
  <v-card class="new-settings">
    <v-card-text>
      <p style="font-size:16px;font-weight: 500;">{{ tl('_new_settings') }}</p>

      <v-list two-line>
        <download-mode></download-mode>
        <DownloadSaveMode />
        <ZipDownloads />
        <DontCreateWorkFolder />
        <CombineRenameRules />
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import DownloadMode from './options/option-items/DownloadMode.vue';
import DownloadSaveMode from './options/option-items/DownloadSaveMode.vue';
import ZipDownloads from './options/option-items/ZipDownloads.vue';
import DontCreateWorkFolder from './options/option-items/DontCreateWorkFolder.vue';
import CombineRenameRules from './options/option-items/CombineRenameRules.vue';

export default {
  name: 'global-task-setting',

  components: {
    'download-mode': DownloadMode,
    DownloadSaveMode,
    ZipDownloads,
    DontCreateWorkFolder,
    CombineRenameRules
  }
};
</script>

<style lang="scss" scoped>
.new-settings {
  margin: 10px 0;
}
</style>
