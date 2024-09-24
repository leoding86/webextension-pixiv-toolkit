<script>
import browser from '@/modules/Extension/browser';

export default {
  name: 'DontCreateWorkFolder',

  data() {
    return {
      showThis: false,
      value: 0
    }
  },

  computed: {
    options() {
      return [{
        text: this.tl('_always_create'),
        value: 0
      }, {
        text: this.tl('_only_if_the_work_has_one_image'),
        value: 1
      }, {
        text: this.tl('_only_when_downloading_one_image'),
        value: 3
      }, {
        text: this.tl('_always_dont'),
        value: 2
      }]
    }
  },

  watch: {
    value(value, oldValue) {
      if ([0, 1, 2, 3].indexOf(value) > -1) {
        browser.storage.local.set({ dontCreateWorkFolder: value });
      } else {
        this.value = oldValue;
      }
    }
  },

  created() {
    this.showThis = this.browserItems.downloadSaveMode === 1;
    this.value = this.browserItems.dontCreateWorkFolder;

    browser.storage.onChanged.addListener(changes => {
      if ('downloadSaveMode' in changes) {
        this.showThis = changes.downloadSaveMode.newValue === 1;
      }
    });
  }
}
</script>

<template>
  <v-list-tile v-if="showThis === true">
    <v-list-tile-content>
      <v-list-tile-title>{{ tl('_dont_create_work_folder') }}</v-list-tile-title>
      <v-list-tile-sub-title>{{ tl('_dont_create_work_folder_desc') }}</v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-select :items="options"
        v-model="value"
        style="width:200px;"
      ></v-select>
    </v-list-tile-action>
  </v-list-tile>
</template>
