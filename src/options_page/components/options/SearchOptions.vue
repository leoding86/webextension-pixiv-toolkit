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
import cr from '@@/modules/cr';
import { Storage as BrowserStorage } from '@/modules/Browser';

export default {
  data() {
    return {
      browserStorage: BrowserStorage.getInstance(),
      enablePtkSearch: browserItems.enablePtkSearch
    }
  },

  mounted() {
    console.log(window.browserItems);
  },

  watch: {
    enablePtkSearch(val) {
      this.browserStorage.set({
        enablePtkSearch: !!val
      });
    }
  },

  methods: {
    tl (string) {
        return cr._e(string);
    }
  }
}
</script>
