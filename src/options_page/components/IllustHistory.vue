<template>
  <div style="max-width:900px;margin:0 auto;padding:0 20px">
    <page-title title="Illust History"></page-title>

    <plus-notice></plus-notice>

    <div style="margin-top:20px;">
      <h2>Screenshot</h2>
      <img :src="example01"
        style="width:100%"
        @click="openInNew(example01)">
    </div>
  </div>
</template>

<script>
import PageTitle from '@@/components/PageTitle'
import PlusNotice from '@@/components/PlusNotice'
import example01 from '@/statics/img/illust-history-screenshot-01.jpg'

export default {
  components: {
    'page-title': PageTitle,
    'plus-notice': PlusNotice
  },

  data() {
    return {
      example01: example01
    };
  },

  beforeMount() {
    //
  },

  methods: {
    openInNew(url) {
      window.open(url, '_blank')
    }
  }
};
</script>

<style lang="scss" scoped>
.card--history-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;

  &:hover .card--type,
  &:hover .card--r {
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }

  .card--history-info {
    font-size: 14px;
    height: 25px;
    line-height: 25px;
    padding: 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card--type {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    transition: all 0.2s;
    z-index: 2;
  }

  .card--r {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    background: rgba(255, 0, 0, 0.8);
    transition: all 0.2s;
    z-index: 2;
  }

  .card--image-wrap {
    position: relative;
    overflow: hidden;
  }

  .card--image__mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: url(../assets/mask.gif) repeat;
    z-index: 1;
    opacity: 1;
    transition: opacity 0.7s
  }

  &:hover .card--image__mask {
    opacity: 0;
  }
}
</style>
