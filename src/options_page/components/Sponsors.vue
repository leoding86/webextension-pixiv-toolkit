<template>
  <v-container>
    <sponsors-card></sponsors-card>
  </v-container>
</template>

<script>
import cr from "@@/modules/cr";
import SponsorsCard from '@/options_page/components/SponsorsCard.vue';
import sponsersData from '@@/../statics/sponsors.json';

export default {
  components: {
    'sponsors-card': SponsorsCard
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

$text-color: #ffed21;
$text-shadow: 2px 2px 0 #df7c11;

.sponsor {

  display: inline-block;
  font-size: 16px;
  border: 1px solid #ccc;
  padding: 5px 15px;
  margin-right: 10px;
  border-radius: 100px;
  background: #fff;
  box-shadow: 3px 3px 0px #ccc;

  .sponser__name {
    position: relative;
  }
}

.sponsor__level-1 {
  font-weight: 300;
}

.sponsor__level-2 {
  font-weight: 1000;
  background: #585c56;
  color: $text-color;
  text-shadow: $text-shadow;
}

.sponsor__level-3 {
  position: relative;
  font-weight: 1000;
  background: #585c56;
  color: $text-color;
  text-shadow: $text-shadow;

  .sponser__glitter-container {
    display: block;
    position: absolute;
    top: -20%;
    left: -10%;
    width: 120%;
    height: 140%;
    background: url(../assets/glitter.gif) 0 -10px;
  }
}
</style>
