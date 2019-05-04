<template>
  <v-container style="max-width: 640px;">
    <supports :showSponsorsLink=false
      :style="{marginBottom: '10px'}"></supports>
    <v-card>
      <v-card-text>
        <ul v-if="sponsors.length > 0">
          <li>sponsor</li>
          <li>sponsor</li>
          <li>sponsor</li>
        </ul>
        <p class="no-sponsor" v-else>Become the very first sponsor ヘ(￣ω￣ヘ)</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Supports from '@/components/Supports';

export default {
  components: {
    supports: Supports
  },

  data () {
    return {
      sponsors: []
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
