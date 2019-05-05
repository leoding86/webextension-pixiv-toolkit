<template>
  <v-container style="max-width: 640px;">
    <supports :showSponsorsLink=false :showPatreon=false></supports>
    <span class="card-title">{{ tl('Change_History') }}</span>
    <v-card>
      <v-card-text>
        <p class="history-entry">
          <strong>2.0.1</strong><br>
          Add selectable rename metas for renaming manga;<br>
          Change extension icons;<br>
          Fix bugs.
        </p>
        <p class="history-entry">
          <strong>2.0.0</strong><br>
          Rename extension name to Pixiv Toolkit;<br>
          Add feature for downloading novel;<br>
          Fix bugs.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Supports from '@/components/Supports';
import cr from '@/modules/cr'

export default {
  components: {
    supports: Supports
  },

  data () {
    return {
      sponsors: []
    }
  },

  methods: {
    tl(string) {
      return cr._e(string);
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
    .card-title {
        display: block;
        font-size: 18px;
        margin-bottom: 10px;
    }
}

.history-entry {
  font-size: 14px;
  margin-bottom: 0;
  padding-bottom: 15px;

  strong {
    font-size: 16px;
  }
}
</style>
