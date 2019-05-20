<template>
  <v-container style="max-width: 640px;">
    <supports :showSponsorsLink=false
      :style="{marginBottom: '10px'}"></supports>
    <v-card>
      <v-card-text>
        <p style="font-size:14px;">{{ tl('sponsor_update_periodically') }}</p>
        <ul v-if="sponsors.length > 0">
          <li></li>
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

  li {
    display: inline-block;
    font-size: 16px;

    &::after {
      content: '/';
      margin: 0 3px;
    }
  }
}
</style>
