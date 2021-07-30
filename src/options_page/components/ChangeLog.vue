<template>
  <div class="change-log">
    <div class="change-log__content"
      v-for="(changeLog ,i) in updateList"
      :key="i"
    >
      <div class="change-log__title">{{ changeLog.version }}</div>
      <ul class="change-log__list">
        <li
          v-for="(item, j) in changeLog.list"
          :key="j"
        >{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import histories from '@/statics/histories.json';

export default {
  data() {
    return {
      loading: true,
      updateList: null
    }
  },

  mounted() {
    this.loadHistory().then(() => {
      this.loading = false;
    });
  },

  methods: {
    formatResult(result) {
      let updateList = [];
      let updates = result.trim().split(/(\r\n\r\n|\r\r|\n\n)/g);

      updates.forEach(update => {
        update = update.trim();

        if (update !== '') {
          let _update = update.split(/[\r\n|\r|\n]/g);

          updateList.push({
            version: _update.shift(),
            list: _update.filter(i => i.trim().length > 0)
          });
        }
      });

      this.updateList = updateList;
    },

    loadHistory () {
      return new Promise(resolve => {
        let language = this.$i18n.locale.replace('_', '-');
        let history = 'en-US';

        if (histories.indexOf(language) > -1) {
          history = language;
        }

        let xhr = new XMLHttpRequest();

        xhr.open('GET', browser.runtime.getURL(`HISTORY_${history}`));

        xhr.onload = event => {
          resolve(this.formatResult(xhr.responseText));
        };

        xhr.send();
      });
    }
  }
}
</script>
