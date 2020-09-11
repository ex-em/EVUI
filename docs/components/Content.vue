<template>
  <div class="evui-content">
    <router-view />
  </div>
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
  padding: 30px;
}
</style>
