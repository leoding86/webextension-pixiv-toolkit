<template>
  <div class="option-section">
    <v-list two-line>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('_page_number_start_with_1') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ tl('_page_number_start_with_1_otherwise_start_with_0') }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-select :items="pageNumberStartWithOneOptions"
            v-model="pageNumberStartWithOne"
            style="width:150px;"
          ></v-select>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('_the_length_of_page_number') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ tl('_zeros_will_be_filled_at_the_beginning_of_page_number') }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-select :items="pageNumberLengthOptions"
            v-model="pageNumberLength"
            style="width:150px;"
          ></v-select>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('_zip_multiple_images') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ tl('_create_a_zip_file_while_downloading_multiple_images') }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-select :items="zipMultipleImagesOptions"
            v-model="zipMultipleImages"
            style="width:150px;"
          ></v-select>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </div>
</template>

<script>
export default {
  name: 'global-task-setting',

  data() {
    return {
      pageNumberStartWithOne: 0,

      pageNumberLength: 0,

      zipMultipleImages: 1
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
      })
    }
  },

  created() {
    this.pageNumberStartWithOne = this.browserItems.globalTaskPageNumberStartWithOne;
    this.pageNumberLength = this.browserItems.globalTaskPageNumberLength;
    this.zipMultipleImages = this.browserItems.globalZipMultipleImages;
  },
};
</script>
