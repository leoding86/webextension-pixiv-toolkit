<template>
  <div class="container container--big">
    <h1>Test cacheable component</h1>
    <cacheable-image style="width:100px;height:100px;"
      mode="background"
      :src="image"></cacheable-image>
    <h1>Debug options</h1>
    <div>
      <button @click="resetVersionNumber">Reset version number</button>
    </div>
    <div>
      <app-suggest :icon="pixivOminaIcon"
        title="Pixiv Omina"
        subTitle="Sub title"
        link="https://www.github.com">
      </app-suggest>
    </div>
  </div>
</template>

<script>
import CacheableImage from './CacheableImage';
import AppSuggest from './AppSuggest';
import pixivOminaIcon from '@/statics/img/pixiv-omina.png';

export default {
  components: {
    'cacheable-image': CacheableImage,
    'app-suggest': AppSuggest
  },

  data() {
    return {
      image: 'https://s.pximg.net/www/images/logo/pixiv-logo.svg',
      pixivOminaIcon: pixivOminaIcon
    }
  },

  methods: {
    resetVersionNumber() {
      browser.storage.local.set({
        version: '0.0.1'
      }, () => {
        browser.storage.local.get(null, items => {
          console.log(items);
          alert(items.version);
        });
      });
    }
  }
}
</script>
