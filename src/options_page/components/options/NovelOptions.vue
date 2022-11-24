<template>
  <div class="option-section">
    <v-list two-line>
      <v-list-tile @click="openRenameDialog()">
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('_rename') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ renameRule }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple>
            <v-icon>keyboard_arrow_right</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('include_novel_description') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ tl('include_novel_description_at_the_beginning') }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch v-model="novelIncludeDescription"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <rename-dialog :show.sync="showRenameDialog"
      v-model="renameRule"
      :title="tl('_novel_rename_rule')"
      :metas="renameMetas"
      :default-value="defaultRenameRule"
    ></rename-dialog>
  </div>
</template>

<script>
import RenameDialog from '@@/components/options/RenameDialog';

export default {
  components: {
    'rename-dialog': RenameDialog,
  },

  data() {
    return {
      showRenameDialog: false,

      defaultRenameRule: '{id}_{title}',

      renameRule: '',

      novelIncludeDescription: false,
    }
  },

  created() {
    this.renameRule = this.browserItems.novelRenameRule;
    this.novelIncludeDescription = this.browserItems.novelIncludeDescription;

    this.renameMetas = [
      {
        title: this.tl("id"),
        holder: "{id}"
      },
      {
        title: this.tl("title"),
        holder: "{title}"
      },
      {
        title: this.tl("author"),
        holder: "{author}"
      },
      {
        title: this.tl("author_id"),
        holder: "{authorId}"
      },
      {
        title: this.tl("year"),
        holder: "{year}"
      },
      {
        title: this.tl("month"),
        holder: "{month}"
      },
      {
        title: this.tl("day"),
        holder: "{day}"
      },
      {
        title: this.tl("_series_id"),
        holder: "{seriesId}"
      },
      {
        title: this.tl("_series_title"),
        holder: "{seriesTitle}"
      },
      {
        title: this.tl("_series_order"),
        holder: "{seriesOrder}"
      }
    ];
  },

  watch: {
    renameRule(val) {
      if (val === '') {
        val = this.renameRule = this.defaultRenameRule;
      }

      browser.storage.local.set({
        novelRenameRule: val
      });
    },

    novelIncludeDescription(val) {
      /**
       * Prevent updating setting after component is created every time
       */
      if (this.browserItems.novelIncludeDescription !== val) {
        browser.storage.local.set({
          novelIncludeDescription: !!val
        });
      }
    },
  },

  methods: {
    openRenameDialog() {
      this.showRenameDialog = true;
    }
  }
}
</script>
