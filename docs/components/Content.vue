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
  position: fixed;
  width: calc(100% - 320px);
  height: calc(100% - 60px);
  overflow: auto;
  padding: 30px 40px;
}
</style>
