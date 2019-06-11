<template>
  <v-container grid-list-md>
    <p v-if="!isPlus">Need Plus Addon</p>
    <v-layout row wrap>
      <v-flex md2 sm3 xs4 v-for="illust in illusts" :key="illust.id">
        <v-card class="card--history-item" @click="openInNew(illust)">
          <v-img :src="illust.images.original" aspect-ratio="1"></v-img>
          <div class="card--history-info">{{ illust.title }}</div>
          <div class="card--type">{{ readableType(illust.type) }}</div>
          <div class="card--r" v-if="!!illust.r">R</div>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import PlusAddon from "@/modules/PlusAddon";

let plusAddon = new PlusAddon();

export default {
  data() {
    return {
      isPlus: null,
      illusts: []
    };
  },

  beforeMount() {
    let vm = this;

    plusAddon.checkPlusAddonInstalled().then(result => {
      vm.isPlus = !!result;

      plusAddon.listIllustHistoriesAction().then(illusts => {
        vm.illusts = illusts;
      });
    });
  },

  methods: {
    readableType(type) {
      if (type == 1) {
        return "M";
      } else if (type == 2) {
        return "A";
      } else if (type == 0) {
        return "I";
      }
    },

    openInNew(illust) {
      window.open('https://www.pixiv.net/member_illust.php?mode=medium&illust_id=' + illust.id)
    }
  }
};
</script>

<style lang="scss" scoped>
.card--history-item {
  position: relative;
  cursor: pointer;

  &:hover .card--type {
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
    transition: all 0.2s
  }
}
</style>
