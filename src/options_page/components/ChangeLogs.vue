<!--
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-01 01:14:07
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-01 01:20:21
 * @FilePath: \webextension-pixiv-toolkit\src\options_page\components\ChangeLogs.vue
-->
<template>
  <v-container>
    <span class="card-title">{{ tl('Change_History') }}</span>

    <v-card>
      <v-card-text>
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
