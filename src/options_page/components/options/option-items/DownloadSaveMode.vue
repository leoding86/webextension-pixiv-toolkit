<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-09-08 11:31:01
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-08 13:20:20
 * @FilePath: \webextension-pixiv-toolkit\src\options_page\components\options\option-items\DownloadSaveMode.vue
-->
<script>
export default {
  name: 'DownloadSaveMode',

  data() {
    return {
      value: 0
    }
  },

  computed: {
    options() {
      return [{
        text: this.tl('_pack_in_zip'),
        value: 0,
      }, {
        text: this.tl('_save_in_folder'),
        value: 1
      }]
    },

    subTitle() {
      if (this.value === 0) {
        return this.tl('_download_save_mode_0_desc');
      } else if (this.value === 1) {
        return this.tl('_download_save_mode_1_desc');
      }
    }
  },

  watch: {
    value(value, oldValue) {
      if ([0, 1].indexOf(value) > -1) {
        browser.storage.local.set({ downloadSaveMode: value });
      } else {
        this.value = oldValue;
      }
    }
  },

  created() {
    this.value = this.browserItems.downloadSaveMode;
  }
};
</script>

<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>{{ tl('_download_save_mode') }}</v-list-tile-title>
      <v-list-tile-sub-title>{{ subTitle }}</v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-select :items="options"
        v-model="value"
        style="width:200px;"
      ></v-select>
    </v-list-tile-action>
  </v-list-tile>
</template>
