<template>
  <div class="app-suggest">
    <div class="app-suggest__icon">
      <a :href="link" target="_blank"><img :src="icon" :alt="title" :title="title"></a>
    </div>
    <div class="app-suggest__info">
      <div class="app-suggest__title">{{ title }}</div>
      <div class="app-suggest__sub-title">{{ subTitle }}</div>
      <div class="app-suggest__more-link">
        <a :href="link" target="_blank">MORE</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      required: true,
      type: String
    },

    title: {
      required: true,
      type: String
    },

    subTitle: {
      required: true,
      type: String
    },

    link: {
      required: true,
      type: String
    }
  }
}
</script>

<style lang="scss">
.app-suggest {
  display: flex;
  height: 80px;
  padding: 12px;
  box-sizing: border-box;
}

.app-suggest__icon {
  position: relative;
  width: 56px;
  height: 56px;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.app-suggest__info {
  flex: auto;
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.app-suggest__title {
  font-size: 16px;
  font-weight: 700;
  line-height: 18px;
}

.app-suggest__sub-title {
  font-size: 12px;
  color: #999;
  line-height: 16px;
}

.app-suggest__more-link {
  flex: auto;
  position: relative;

  a {
    display: inline-block;
    position: absolute;
    bottom: 0;
    padding: 0px 8px;
    font-size: 12px;
    border-radius: 15px;
    background: rgb(51, 103, 214);
    color: #fff;
    text-decoration: none;
  }
}
</style>
