<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Novel') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile @click="openRenameDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('rename_novel') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ novelRenameFormatPreview }}</v-list-tile-sub-title>
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
    </v-card>

    <router-view></router-view>
  </div>
</template>

<script>
import SuperMixin from '@/mixins/SuperMixin';

export default {
  mixins: [
    SuperMixin
  ],

  data() {
    return {
      novelIncludeDescription: false
    }
  },

  computed: {
    novelRenameFormatPreview() {
      return this.browserItems.novelRenameFormat
    }
  },

  beforeMount() {
    this.novelIncludeDescription = this.browserItems.novelIncludeDescription;
  },

  watch: {
    novelIncludeDescription(val) {
      /**
       * Prevent updating setting after component is created every time
       */
      if (this.browserItems.novelIncludeDescription !== val) {
        browser.storage.local.set({
          novelIncludeDescription: !!val
        });
      }
    }
  },

  methods: {
    openRenameDialog() {
      this.$router.push({
        name: "RenameNovel"
      });
    }
  }
}
</script>
