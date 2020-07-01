<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Search') }}</span>

    <v-card>
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Enable_search_suffix') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('Add_a_search_suffix_for_searching_popular_works_probably') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="enablePtkSearch"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      enablePtkSearch: true
    }
  },

  beforeMount() {
    this.enablePtkSearch = this.browserItems.enablePtkSearch;
  },

  watch: {
    enablePtkSearch(val) {
      browser.storage.local.set({
        enablePtkSearch: !!val
      });
    }
  }
}
</script>
