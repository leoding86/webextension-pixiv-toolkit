<script>
import browser from '@/modules/Extension/browser';

export default {
  name: 'CombineRenameRules',

  data() {
    return {
      showThis: false,
      value: 0
    }
  },

  computed: {
    options() {
      return [
        { text: this.tl('_enable'), value: 1 },
        { text: this.tl('_disable'), value: 0}
      ]
    }
  },

  watch: {
    value(val) {
      browser.storage.local.set({ combinWRRuleAndIRRuleWhenDontCreateWorkFolder: val });
    }
  },

  created() {
    this.value = this.browserItems.combinWRRuleAndIRRuleWhenDontCreateWorkFolder;
    this.showThis = this.browserItems.downloadSaveMode === 1;

    browser.storage.onChanged.addListener(changes => {
      if ('downloadSaveMode' in changes) {
        this.showThis = changes.downloadSaveMode.newValue === 1;
      }
    });
  }
};
</script>

<template>
  <v-list-tile v-if="showThis">
    <v-list-tile-content>
      <v-list-tile-title>{{ tl('_combin_work_and_image_rename_rule_when_dont_create_work_folder') }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-select :items="options"
        v-model="value"
        style="width:150px;"
      ></v-select>
    </v-list-tile-action>
  </v-list-tile>
</template>