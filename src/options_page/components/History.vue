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
import cr from '@@/modules/cr'

export default {
  components: {
    supports: Supports
  },

  data () {
    return {
      xhr: null,
      sponsors: [],
      history: 'loading',
      showHistoryWhenUpdateCompleted: true
    }
  },

  mounted () {
    let vm = this;

    cr._s.get(null).then(items => {
      vm.showHistoryWhenUpdateCompleted = items.showHistoryWhenUpdateCompleted
    });

    this.loadHistory().then(history => {
      vm.history = history;
    });
  },

  watch: {
    showHistoryWhenUpdateCompleted (val) {
      cr._s.set({
        showHistoryWhenUpdateCompleted: val
      });
    }
  },

  methods: {
    loadHistory () {
      let vm = this;

      return new Promise(resolve => {
        if (!vm.xhr) {
          vm.xhr = new XMLHttpRequest();
        }

        vm.xhr.open('get', cr._r.getURL('HISTORY'));
        vm.xhr.onload = () => {
          let parts = vm.xhr.responseText.split(/-{46}/);
          resolve(parts[1].trim().replace(/[\r\n|\r|\n]/g, '<br>'));
        };

        vm.xhr.send();
      });
    },

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
