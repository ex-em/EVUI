<template>
  <div
    :class="['evui-docs', docsTheme]"
  >
    <div class="evui-wrapper">
      <MainHeader />
      <MainNav />
      <MainContent />
    </div>
  </div>
</template>

<script>
import { ref, provide } from 'vue';
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
    const changeDocsTheme = () => {
      if (docsTheme.value === 'light') {
        docsTheme.value = 'dark';
      } else {
        docsTheme.value = 'light';
      }
    };

    provide('docsTheme', docsTheme);
    provide('changeDocsTheme', changeDocsTheme);

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

.dark {
  @import './style/lib/highlightjs.hybrid';
}

.light {
  @import './style/lib/highlightjs.github';
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
