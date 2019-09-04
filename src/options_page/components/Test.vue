<template>
  <div class="test">
    <h1>test page</h1>
    <cacheable-image style="width:100px;height:100px;"
      mode="background"
      :src="image"></cacheable-image>
  </div>
</template>

<script>
import CacheableImage from './CacheableImage';

export default {
  components: {
    'cacheable-image': CacheableImage
  },

  data() {
    return {
      image: 'https://s.pximg.net/www/images/logo/pixiv-logo.svg'
    }
  }
}
</script>
