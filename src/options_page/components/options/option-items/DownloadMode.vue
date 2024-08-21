<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 14:04:19
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 14:09:28
 * @FilePath: \webextension-pixiv-toolkit\src\options_page\components\options\option-items\DownloadMode.vue
-->
<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>{{ tl('_download_mode') }}</v-list-tile-title>
      <v-list-tile-sub-title style="color:brown">{{ tl('_download_mode_desc') }}</v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-select
        :items="[
          { text: this.tl('_legacy'), value: 1 },
          { text: this.tl('_download_manager'), value: 2 }
        ]"
        v-model="downloadMode"
        style="width:100px;"
      ></v-select>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: false
    }
  },

  data() {
    return {
      downloadMode: 1
    }
  },

  watch: {
    downloadMode(val, oldVal) {
      if ([1, 2].indexOf(val) < 0) {
        this.downloadMode = oldVal;
        return;
      }

      this.$emit('input', val);

      browser.storage.local.set({ downloadMode: val });
    }
  },

  created() {
    this.downloadMode = this.browserItems.downloadMode || 1;
  }
};
</script>
