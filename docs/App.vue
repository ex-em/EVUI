<template>
  <div
    :class="['evui-docs', docsTheme]"
  >
    <div class="evui-wrapper">
      <MainHeader
        v-model="docsTheme"
      />
      <MainNav />
      <MainContent />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import MainHeader from './components/Header';
import MainContent from './components/Content';
import MainNav from './components/Menu';

export default {
  name: 'Home',
  components: {
    MainHeader,
    MainContent,
    MainNav,
  },
  setup() {
    const docsTheme = ref('light');
    return {
      docsTheme,
    };
  },
};
</script>

<style lang="scss">
@import './style/index.scss';

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
}

.evui-wrapper {
  position: relative;
  min-height: 100vh;
  padding: $header-height 0 0 $nav-width;

  @include themify() {
    color: themed('font-color-base');
    background-color: themed('background-color-base');
  }
}
</style>
