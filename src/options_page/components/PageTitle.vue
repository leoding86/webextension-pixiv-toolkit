<template>
  <div class="page-title__wrap">
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
export default {
  props: {
    title: String
  }
}
</script>

<style lang="scss" scoped>
.page-title__wrap {
  padding: 10px 0;
}
</style>
