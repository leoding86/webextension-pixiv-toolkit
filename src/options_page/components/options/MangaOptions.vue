<template>
  <div class="option-section">
    <v-list two-line>
      <v-list-tile @click="showRenameDialog = true">
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('_rename_manga') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ renameRule }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple>
            <v-icon>keyboard_arrow_right</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile @click="showRenameImageDialog = true">
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('_rename_manga_image') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ renameImageRule }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple>
            <v-icon>keyboard_arrow_right</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

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
    </v-list>

    <rename-dialog :show.sync="showRenameDialog"
      v-model="renameRule"
      :title="tl('_rename_manga')"
      :metas="renameMetas"
      :default-value="defaultRenameRule"
    ></rename-dialog>

    <rename-dialog :show.sync="showRenameImageDialog"
      v-model="renameImageRule"
      :title="tl('_rename_mange_image')"
      :metas="renameImageMetas"
      :default-value="defaultRenameImageRule"
    ></rename-dialog>
  </div>
</template>

<script>
import browser from '@/modules/Extension/browser';
import RenameDialog from '@@/components/options/RenameDialog';

export default {
  components: {
    'rename-dialog': RenameDialog,
  },

  data() {
    return {
      showRenameDialog: false,

      defaultRenameRule: '{id}_{title}',

      renameRule: "",

      showRenameImageDialog: false,

      defaultRenameImageRule: 'p{pageNum}',

      renameImageRule: "",

      pageNumberStartWithOne: -2,

      pageNumberLength: -2,
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
      }, {
        text: this.tl('_global_setting'),
        value: -2
      }];
    },

    pageNumberStartWithOneOptions() {
      return [{
        text: this.tl('_enable'),
        value: 1,
      }, {
        text: this.tl('_disable'),
        value: 0,
      }, {
        text: this.tl('_global_setting'),
        value: -2
      }]
    },

    renameMetas() {
      return [{
        title: this.tl("_id"),
        holder: "{id}"
      },
      {
        title: this.tl("_author_id"),
        holder: "{authorId}"
      },
      {
        title: this.tl("_title"),
        holder: '{title}'
      },
      {
        title: this.tl("_author"),
        holder: '{author}'
      },
      {
        title: this.tl("_year"),
        holder: "{year}"
      },
      {
        title: this.tl("_month"),
        holder: "{month}"
      },
      {
        title: this.tl("_day"),
        holder: "{day}"
      }];
    },

    renameImageMetas() {
      return this.renameMetas.concat({
        title: this.tl("_page_num"),
        holder: "{pageNum}"
      });
    }
  },

  watch: {
    renameRule(val) {
      if (val === '') {
        val = this.defaultRenameRule;
      }

      browser.storage.local.set({
        mangaRenameRule: val,
      });
    },

    renameImageRule(val) {
      if (val === '') {
        val = this.defaultRenameImageRule;
      }

      browser.storage.local.set({
        mangaRenameImageRule: val
      });
    },

    pageNumberStartWithOne(val) {
      browser.storage.local.set({
        mangaPageNumberStartWithOne: val
      });
    },

    pageNumberLength(val) {
      browser.storage.local.set({
        mangaPageNumberLength: val
      });
    },
  },

  created() {
    this.renameRule = this.browserItems.mangaRenameRule;
    this.renameImageRule = this.browserItems.mangaRenameImageRule;
    this.pageNumberStartWithOne = this.browserItems.mangaPageNumberStartWithOne;
    this.pageNumberLength = this.browserItems.mangaPageNumberLength;
  },
};
</script>
