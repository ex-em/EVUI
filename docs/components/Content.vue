<template>
  <div class="evui-main-content">
    <MenuNav />
    <div class="evui-main-content-body">
      <router-view />
    </div>
  </div>
</template>

<script>
import MenuNav from '../components/Menu';

export default {
  components: {
    MenuNav,
  },
  setup() {},
};
</script>

<style scoped>
.evui-main-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0 240px;
}

.evui-main-content-body {
  padding: 20px;
}
</style>
