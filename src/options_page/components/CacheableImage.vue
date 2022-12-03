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

    defaultImage: {
      type: String,
      default: 'data:image/gif;base64,R0lGODlhAQABAIAAAN/f3wAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMTQgNzkuMTUxNDgxLCAyMDEzLzAzLzEzLTEyOjA5OjE1ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjhFRUMzOEMwMDY4QjExRUFCMTUwRDEyRjc1QThERDhDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjhFRUMzOEMxMDY4QjExRUFCMTUwRDEyRjc1QThERDhDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OEVFQzM4QkUwNjhCMTFFQUIxNTBEMTJGNzVBOEREOEMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OEVFQzM4QkYwNjhCMTFFQUIxNTBEMTJGNzVBOEREOEMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs='
    },

    mode: {
      required: false,
      type: String,
      default: 'image'
    },
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
      // console.log(val)
      this.imageSrc = val;

      // this.cacheService.getCache(val).then(src => {
      //   this.imageSrc = src;
      // });
    }
  },

  created() {
    this.imageSrc = this.src;

    // this.cacheService.getCache(this.src).then(src => {
    //   this.imageSrc = src;
    // });
  }
}
</script>

<style lang="scss">
.cacheable-image {
  position: relative;
  background: #fff;

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
