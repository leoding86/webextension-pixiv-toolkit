<template>
  <v-container style="max-width: 640px;">
    <supports></supports>
    <span class="card-title">{{ tl('Change_History') }}</span>

    <v-card>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('setting_show_history_when_update_completed') }}</v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-switch v-model="showHistoryWhenUpdateCompleted"></v-switch>
        </v-list-tile-action>
      </v-list-tile>
      <v-divider></v-divider>
      <v-card-text>
        <img src="@/statics/img/example.gif" style="width:100%;border-radius: 5px;box-shadow:0 1px 3px rgba(0,0,0,0.5);">
        <div style="font-size:14px" v-html="history"></div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Supports from '@@/components/Supports';
import SuperMixin from '@/mixins/SuperMixin';

export default {
  mixins: [
    SuperMixin
  ],

  components: {
    supports: Supports
  },

  data () {
    return {
      xhr: null,
      history: 'loading',
      showHistoryWhenUpdateCompleted: true
    }
  },

  mounted () {
    let vm = this;

    this.showHistoryWhenUpdateCompleted = this.browserItems.showHistoryWhenUpdateCompleted;

    this.loadHistory().then(history => {
      vm.history = history;
    });
  },

  watch: {
    showHistoryWhenUpdateCompleted (val) {
      browser.storage.local.set({
        showHistoryWhenUpdateCompleted: val
      });
    }
  },

  methods: {
    loadHistory () {
      return new Promise(resolve => {
        if (!this.xhr) {
          this.xhr = new XMLHttpRequest();
        }

        this.xhr.open('get', browser.runtime.getURL('HISTORY'));

        this.xhr.setRequestHeader("Content-Type", "text/plain");

        this.xhr.onload = () => {
          let parts = this.xhr.responseText.split(/-{46}/);
          resolve(parts[1].trim().replace(/[\r\n|\r|\n]/g, '<br>'));
        };

        this.xhr.send();
      });
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
