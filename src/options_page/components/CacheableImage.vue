<template>
  <div class="cacheable-image">
    <img v-if="mode === 'image'"
      :src="usedSrc">
    <div v-else-if="mode === 'background'"
      class="cacheable-image-bg"
      :style="{backgroundImage: 'url(' + usedSrc + ')'}"></div>
  </div>
</template>

<script>
import AssetCacheService from '@@/modules/AssetCacheService';

export default {
  props: {
    placeholder: {
      required: false,
      type: String,
      default: ''
    },

    src: {
      required: true,
      type: String
    },

    mode: {
      required: false,
      type: String,
      default: 'image'
    },

    cacheService: {
      type: Object,
      default: () => {
        return AssetCacheService.getInstance()
      }
    }
  },

  data() {
    return {
      imageSrc: null
    }
  },

  computed: {
    usedSrc() {
      return this.imageSrc || this.placeholder
    }
  },

  watch: {
    src(val) {
      this.cacheService.getCache(val).then(src => {
        this.imageSrc = src;
      });
    }
  },

  mounted() {
    this.cacheService.getCache(this.src).then(src => {
      this.imageSrc = src;
    });
  }
}
</script>

<style lang="scss">
.cacheable-image {
  position: relative;

  .cacheable-image-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background-repeat: none;
    background-size: cover;
    background-position: center center;
  }
}
</style>
