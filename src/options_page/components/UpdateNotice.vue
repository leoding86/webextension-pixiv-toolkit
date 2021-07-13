<template>
  <v-dialog
    v-model="show"
    width="50%"
    :scrollable="true"
  >
    <v-card>

      <v-card-title class="headline grey lighten-2" primary-title>Change Log</v-card-title>

      <v-card-text>
        <div style="font-size:20px;font-weight:700;margin-bottom:10px;text-align:center;">✨{{ tl('_sponsors') }}✨</div>
        <sponsors-card></sponsors-card>
        <change-log></change-log>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="closeNotice">{{ tl('_close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SponsorsCard from '@/options_page/components/SponsorsCard.vue';
import ChangeLog from '@/options_page/components/ChangeLog'

export default {
  components: {
    'change-log': ChangeLog,
    'sponsors-card': SponsorsCard,
  },

  data() {
    return {
      show: false
    }
  },

  mounted() {
    if (!this.browserItems.showUpdateChangeLog) {
      this.show = true;
    }
  },

  methods: {
    closeNotice() {
      browser.storage.local.set({ showUpdateChangeLog: true });

      this.show = false;
    }
  }
};
</script>
