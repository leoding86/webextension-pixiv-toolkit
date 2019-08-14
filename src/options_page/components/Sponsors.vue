<template>
  <v-container style="max-width: 640px;">
    <supports :showSponsorsLink=false
      :style="{marginBottom: '10px'}"></supports>
    <v-card>
      <v-card-text>
        <p style="font-size:14px;">{{ tl('sponsor_update_periodically') }} ~ヾ(＾∇＾)</p>
        <p style="font-size:14px;" v-if="sponsors === null">Loading sponsors...</p>
        <ul v-else-if="sponsors.length > 0">
          <li v-for="(sponsor, i) in sponsors" :key="i" :class="'sponsor sponsor__level-' + sponsor.level">{{ sponsor.name }}</li>
        </ul>
        <p class="no-sponsor" v-else>{{ tl('sponsor_very_first') }} ~ヾ(＾∇＾)</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import cr from "@@/modules/cr";
import Supports from '@@/components/Supports';
import sponsersData from '@@/../statics/sponsors.json';

export default {
  components: {
    supports: Supports
  },

  data () {
    return {
      sponsors: null
    }
  },

  mounted () {
    let vm = this,
        sponsorsUrl = 'https://raw.githubusercontent.com/leoding86/pixiv-toolkits/master/src/statics/sponsors.json',
        xhr = new XMLHttpRequest();

    xhr.open('get', sponsorsUrl);

    xhr.onload = function () {
      let sponsors = JSON.parse(this.responseText);

      vm.sponsors = (Object.prototype.toString.call(sponsors) === '[object Array]' && sponsors.length > 0) ? sponsors : [];
    };

    xhr.send();
  },

  methods: {
    tl(string) {
      return cr._e(string);
    }
  }
}
</script>

<style lang="scss" scoped>
p.no-sponsor {
  font-size: 16px;
  margin-bottom: 0;
}

ul {
  list-style: none;
  padding-left: 0;

  li {
    display: inline-block;
    margin-bottom: 10px;
    font-size: 16px;
  }
}

.sponsor {
  display: inline-block;
  font-size: 16px;
  border: 1px solid #ccc;
  padding: 5px 15px;
  margin-right: 10px;
  border-radius: 100px;
  background: #fff;
}

.sponsor__level-1 {
  font-weight: 300;
}

.sponsor__level-2 {
  font-weight: 1000;
}
</style>
