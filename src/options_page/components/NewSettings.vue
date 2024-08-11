<template>
    <v-card class="new-settings">
        <v-card-text>
            <p style="font-size:16px;font-weight: 500;">{{ tl('_new_settings') }}</p>
            <p style="font-size:16px;font-weight: 500;">{{ tl('_download_task_settings') }}</p>

            <v-card>
                <v-card-text>
                    <download-mode></download-mode>

                    <v-list-tile>
                        <v-list-tile-content>
                        <v-list-tile-title>{{ tl('_dont_create_work_folder') }}</v-list-tile-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                        <v-select :items="dontCreateWorkFolderOptions"
                            v-model="dontCreateWorkFolder"
                            style="width:175px;"
                        ></v-select>
                        </v-list-tile-action>
                    </v-list-tile>

                    <v-list-tile v-if="[1,2].indexOf(dontCreateWorkFolder) > -1">
                        <v-list-tile-content>
                        <v-list-tile-title>{{ tl('_combin_work_and_image_rename_rule_when_dont_create_work_folder') }}</v-list-tile-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                        <v-select :items="zipMultipleImagesOptions"
                            v-model="combinWRRuleAndIRRuleWhenDontCreateWorkFolder"
                            style="width:150px;"
                        ></v-select>
                        </v-list-tile-action>
                    </v-list-tile>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>

<script>
import DownloadMode from './options/option-items/DownloadMode.vue';

export default {
  name: 'global-task-setting',

  components: {
    'download-mode': DownloadMode
  },

  data() {
    return {
      pageNumberStartWithOne: 0,

      pageNumberLength: 0,

      zipMultipleImages: 1,

      dontCreateWorkFolder: 0,

      combinWRRuleAndIRRuleWhenDontCreateWorkFolder: 0
    };
  },

  computed: {
    pageNumberLengthOptions() {
      return [{
        text: this.tl('_disable'),
        value: 0,
      }, {
        text: this.tl('_dynamic'),
        value: -1,
      }, {
        text: '2',
        value: 2
      }, {
        text: '3',
        value: 3
      }, {
        text: '4',
        value: 4
      }];
    },

    pageNumberStartWithOneOptions() {
      return [{
        text: this.tl('_enable'),
        value: 1,
      }, {
        text: this.tl('_disable'),
        value: 0,
      }]
    },

    zipMultipleImagesOptions() {
      return [{
        text: this.tl('_enable'),
        value: 1,
      }, {
        text: this.tl('_disable'),
        value: 0
      }]
    },

    dontCreateWorkFolderOptions() {
      return [{
        text: this.tl('_disable'),
        value: 0
      }, {
        text: this.tl('_when_there_is_only_one_image'),
        value: 1
      }, {
        text: this.tl('_always'),
        value: 2
      }]
    }
  },

  watch: {
    pageNumberStartWithOne(val) {
      browser.storage.local.set({
        globalTaskPageNumberStartWithOne: val
      });
    },

    pageNumberLength(val) {
      browser.storage.local.set({
        globalTaskPageNumberLength: val
      });
    },

    zipMultipleImages(val) {
      browser.storage.local.set({
        globalZipMultipleImages: val
      });
    },

    dontCreateWorkFolder(val) {
      browser.storage.local.set({
        dontCreateWorkFolder: val
      });
    },

    combinWRRuleAndIRRuleWhenDontCreateWorkFolder(val) {
      browser.storage.local.set({
        combinWRRuleAndIRRuleWhenDontCreateWorkFolder: val
      });
    }
  },

  created() {
    this.pageNumberStartWithOne = this.browserItems.globalTaskPageNumberStartWithOne;
    this.pageNumberLength = this.browserItems.globalTaskPageNumberLength;
    this.zipMultipleImages = this.browserItems.globalZipMultipleImages;
    this.dontCreateWorkFolder = this.browserItems.dontCreateWorkFolder;
    this.combinWRRuleAndIRRuleWhenDontCreateWorkFolder = this.browserItems.combinWRRuleAndIRRuleWhenDontCreateWorkFolder;
  },
};
</script>

<style lang="scss" scoped>
.new-settings {
    margin: 10px 0;
}
</style>
