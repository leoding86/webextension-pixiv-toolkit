<template>
  <v-container style="max-width: 640px;">
    <span class="card-title">{{ tl('Change_History') }}</span>

    <v-card>
      <v-card-text>
        <img src="https://raw.githubusercontent.com/leoding86/webextension-pixiv-toolkit/master/src/statics/remote/img/example.gif"
          style="width:100%;border-radius: 5px;box-shadow:0 1px 3px rgba(0,0,0,0.5);margin-bottom:15px;">
        <div style="font-size:14px" v-html="history"></div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import SuperMixin from '@/mixins/SuperMixin';

export default {
  mixins: [
    SuperMixin
  ],

  data () {
    return {
      xhr: null,
      history: 'loading'
    }
  },

  mounted () {
    let vm = this;

    this.loadHistory().then(history => {
      vm.history = history;
    });
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
          resolve(parts[1].trim().replace(/\r\n|\r|\n/g, '<br>'));
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
