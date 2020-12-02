<template>
  <main class="evui-content">
    <router-view />
  </main>
</template>

<script>
export default {
  setup() {},
};
</script>

<style lang="scss" scoped>
@import '../style/index.scss';

.evui-content {
  height: 100%;
  padding: 30px 40px;
  overflow: auto;

  @include themify() {
    color: themed('font-color-base');
    background-color: themed('background-color-base');
  }
}
</style>
