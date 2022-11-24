<template>
  <div class="option-section download-task-settings">
    <span class="option-card-title">{{ tl('_download_task_settings') }}</span>

    <v-expansion-panel>
      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="download-task-settings__title">{{ tl('_global_settings') }}</div>
        </template>
        <global-task-settings></global-task-settings>
      </v-expansion-panel-content>

      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="download-task-settings__title">Pixiv {{ tl('Ugoira') }}</div>
        </template>
        <ugoria-options></ugoria-options>
      </v-expansion-panel-content>

      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="download-task-settings__title">Pixiv {{ tl('Illustration') }}</div>
        </template>
        <illust-options></illust-options>
      </v-expansion-panel-content>

      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="download-task-settings__title">Pixiv {{ tl('Manga') }}</div>
        </template>
        <manga-options></manga-options>
      </v-expansion-panel-content>

      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="download-task-settings__title">Pixiv {{ tl('Novel') }}</div>
        </template>
        <novel-options></novel-options>
      </v-expansion-panel-content>

      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="download-task-settings__title">Pixiv Comic</div>
        </template>
        <pixiv-comic-options></pixiv-comic-options>
      </v-expansion-panel-content>

      <v-expansion-panel-content>
        <template v-slot:header>
          <div class="download-task-settings__title">Fanbox</div>
        </template>
        <fanbox-post-settings></fanbox-post-settings>
      </v-expansion-panel-content>

    </v-expansion-panel>
  </div>
</template>

<script>
import GlobalTaskSettings from '@@/components/options/GlobalTaskSettings';
import UgoiraOptions from '@@/components/options/UgoiraOptions';
import IllustrationOptions from '@@/components/options/IllustrationOptions';
import MangaOptions from '@@/components/options/MangaOptions';
import NovelOptions from '@@/components/options/NovelOptions';
import PixivComicOptions from '@@/components/options/PixivComicOptions';
import FanboxPostSettings from '@@/components/options/FanboxPostSettings';

export default {
  name: 'download-task-settings',

  components: {
    'global-task-settings': GlobalTaskSettings,
    'ugoria-options': UgoiraOptions,
    'illust-options': IllustrationOptions,
    'manga-options': MangaOptions,
    'novel-options': NovelOptions,
    'pixiv-comic-options': PixivComicOptions,
    'fanbox-post-settings': FanboxPostSettings,
  },
};
</script>

<style lang="scss">
.download-task-settings {
  .v-list__tile {
    padding: 0 24px;
  }
}

.download-task-settings__title {
  font-size: 18px;
}
</style>
