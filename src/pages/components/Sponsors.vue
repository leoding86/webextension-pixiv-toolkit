<template>
  <v-container style="max-width: 640px;">
    <supports :showSponsorsLink=false
      :style="{marginBottom: '10px'}"></supports>
    <v-card>
      <v-card-text>
        <p style="font-size:14px;">{{ tl('sponsor_update_periodically') }} ~ヾ(＾∇＾)</p>
        <ul v-if="sponsors.length > 0">
          <li v-for="(sponsor, i) in sponsors" :key="i" :class="'sponsor sponsor__level-' + sponsor.level">{{ sponsor.name }}</li>
        </ul>
        <p class="no-sponsor" v-else>{{ tl('sponsor_very_first') }} ~ヾ(＾∇＾)</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import cr from "@/modules/cr";
import Supports from '@/components/Supports';

export default {
  components: {
    supports: Supports
  },

  data () {
    return {
      sponsors: []
    }
  },

  mounted () {
    let vm = this,
        sponsorsUrl = cr._r.getURL('sponsors.json'),
        xhr = new XMLHttpRequest();

    xhr.open('get', sponsorsUrl);

    xhr.onload = function () {
      let sponsors = JSON.parse(this.responseText);

      vm.sponsors = sponsors;
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

.level-1 {

}

.sponsor__level-2 {
  font-weight: 1000;
}
</style>
