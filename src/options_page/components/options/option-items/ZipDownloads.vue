<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-09-08 10:55:45
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-08 11:52:31
 * @FilePath: \webextension-pixiv-toolkit\src\options_page\components\options\option-items\ZipDownloads.vue
-->
<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-09-08 10:55:45
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-08 11:15:17
 * @FilePath: \webextension-pixiv-toolkit\src\options_page\components\options\option-items\ZipDownloads.vue
-->
<script>
import browser from '@/modules/Extension/browser';

export default {
  name: 'ZipDownloads',

  data() {
    return {
      value: 1,
      showThis: false
    }
  },

  computed: {
    options() {
      return [{
        text: this.tl('_enable'),
        value: 1,
      }, {
        text: this.tl('_only_if_the_work_has_multiple_images'),
        value: 2
      }, {
        text: this.tl('_only_when_downloading_multiple_images'),
        value: 3,
      }, {
        text: this.tl('_disable'),
        value: 0
      }]
    }
  },

  watch: {
    value(value, oldValue) {
      if ([0, 1, 2, 3].indexOf(value) > -1) {
        browser.storage.local.set({ globalZipMultipleImages: value });
      } else {
        this.value = oldValue;
      }
    }
  },

  created() {
    this.showThis = this.browserItems.downloadSaveMode === 0;
    this.value = this.browserItems.globalZipMultipleImages;

    browser.storage.onChanged.addListener(changes => {
      if ('downloadSaveMode' in changes) {
        this.showThis = changes['downloadSaveMode'].newValue === 0;
      }
    });
  }
};
</script>

<template>
  <v-list-tile v-if="showThis === true">
    <v-list-tile-content>
      <v-list-tile-title>{{ tl('_zip_multiple_images') }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-select :items="options"
        v-model="value"
        style="width:200px;"
      ></v-select>
    </v-list-tile-action>
  </v-list-tile>
</template>
