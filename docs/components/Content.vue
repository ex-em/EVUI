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
  position: relative;
  padding: 30px 40px;
}
</style>
