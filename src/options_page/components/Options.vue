<template>
  <v-container style="max-width: 640px;">
    <ugoira-options></ugoira-options>

    <illustration-options></illustration-options>

    <manga-options></manga-options>

    <novel-options></novel-options>

    <download-options ></download-options>

    <history-options></history-options>

    <search-options v-if="false"></search-options>

    <other-options></other-options>

    <div class="no-margin-buttons">
      <v-btn
        depressed
        color="info"
        @click="exportSettings"
      >{{ tl('_export_settings') }}</v-btn>

      <v-btn
        depressed
        color="info"
        @click="importSettings"
      >{{ tl('_import_settings') }}</v-btn>
    </div>
  </v-container>
</template>

<script>
import '@@/assets/global.scss';
import CopyStr from '@/modules/Util/CopyStr';
import UgoiraOptions from '@@/components/options/UgoiraOptions';
import IllustrationOptions from '@@/components/options/IllustrationOptions';
import MangaOptions from '@@/components/options/MangaOptions';
import NovelOptions from '@@/components/options/NovelOptions';
import DownloadOptions from '@@/components/options/DownloadOptions';
import HistoryOptions from '@@/components/options/HistoryOptions';
import SearchOptions from '@@/components/options/SearchOptions';
import OtherOptions from '@@/components/options/OtherOptions';
import defaultSettings from '@/config/default';

export default {
  name: 'Options',

  components: {
    'ugoira-options': UgoiraOptions,
    'illustration-options': IllustrationOptions,
    'manga-options': MangaOptions,
    'novel-options': NovelOptions,
    'download-options': DownloadOptions,
    'history-options': HistoryOptions,
    'search-options': SearchOptions,
    'other-options': OtherOptions
  },

  methods: {
    copySettings() {
      CopyStr.copy(JSON.stringify(this.browserItems));
      alert('Copied');
    },

    exportSettings() {
      let blob = new Blob([JSON.stringify(this.browserItems)], {type: 'application/json'})

      let a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'pixiv_toolkit_settings-' + Date.now() + '.json'
      document.body.appendChild(a);
      a.click();
      a.remove();
    },

    importSettings() {
      let input = document.createElement('input');

      input.type = 'file'
      input.addEventListener('change', (e) => {
        const files = e.target.files

        let fileReader = new FileReader()

        fileReader.addEventListener('load', () => {
          try {
            let importSettings = JSON.parse(fileReader.result);

            if (importSettings) {
              let setting;

              Object.keys(defaultSettings).forEach(key => {
                if (importSettings[key] &&
                  (typeof defaultSettings[key] === typeof importSettings[key] || typeof importSettings[key] === 'string') // checking logical need improve
                ) {
                  defaultSettings[key] = importSettings[key];
                }
              });

              browser.storage.local.set(defaultSettings);

              alert('Settings imported');

              window.location.reload();
            }
          } catch (e) {
            console.log(e)
          }
        });

        fileReader.readAsText(files[0])
      });

      input.click();
    }
  }
}
</script>

<style lang="scss">
#app {
  .option-section {
    margin-bottom: 30px;

    .option-card-title {
      display: block;
      font-size: 18px;
      margin-bottom: 10px;
    }
  }
}
</style>
