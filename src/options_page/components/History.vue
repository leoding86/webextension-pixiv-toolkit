<template>
  <v-container>
    <span class="card-title">{{ tl('Change_History') }}</span>

    <v-card>
      <v-card-text>
        <img src="https://raw.githubusercontent.com/leoding86/webextension-pixiv-toolkit/master/src/statics/remote/img/example.gif"
          style="width:100%;border-radius: 5px;box-shadow:0 1px 3px rgba(0,0,0,0.5);margin-bottom:15px;">
        <change-log></change-log>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import ChangeLog from '@/options_page/components/ChangeLog';

export default {
  components: {
    'change-log': ChangeLog
  }
}
</script>

<style lang="scss" scoped>
#app {
    .card-title {
        display: block;
        font-size: 18px;
        margin-bottom: 10px;
    }
}
</style>
