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
import SuperMixin from '@/mixins/SuperMixin';
import PackageFileReader from '@/modules/Util/PackageFileReader';

export default {
  mixins: [ SuperMixin ],

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
      let updates = result.trim().split(/(\r\n{2}|\r{2}|\n{2})/g);

      updates.forEach(update => {
        update = update.trim();

        if (update !== '') {
          let _update = update.split(/[\r\n|\r|\n]/g);

          updateList.push({
            version: _update.shift(),
            list: _update
          });
        }
      });

      this.updateList = updateList;
    },

    loadHistory () {
      return new Promise(resolve => {
        let language = browser.i18n.getUILanguage();

        PackageFileReader.read(`HISTORY_${language}`, result => {
          resolve(this.formatResult(result));
        }, error => {
          PackageFileReader.read('HISTORY_en-US', result => {
            resolve(this.formatResult(result));
          });
        });
      });
    }
  }
}
</script>
