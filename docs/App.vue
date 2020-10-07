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
$file-path: './assets/fonts/';

@import './style/index.scss';

@font-face {
  font-family: 'Roboto';
  src: url($file-path + 'Roboto-Bold.ttf') format('trutype');
  font-weight: 800;
  font-style: normal;
}
@font-face {
  font-family: 'Roboto';
  src: url($file-path + 'Roboto-Medium.ttf') format('trutype');
  font-weight: 600;
  font-style: normal;
}
@font-face {
  font-family: 'Roboto';
  src: url($file-path + 'Roboto-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: 'Roboto', Arial, 'Helvetica Neue', Helvetica, sans-serif;
}
.evui-wrapper {
  position: relative;
  min-height: 100vh;
  padding: $header-height 0 0 $nav-width;
  font-size: $font-size-base;

  @include themify() {
    color: themed('font-color-base');
    background-color: themed('background-color-base');
  }
}
.dark {
  @import './style/lib/highlightjs.hybrid';
}
.light {
  @import './style/lib/highlightjs.github';
}
.hljs {
  &, * {
    font-size: 14px;
    font-family: consolas, monospace;
  }
}
</style>
